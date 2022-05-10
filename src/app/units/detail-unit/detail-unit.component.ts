import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UnitsService} from '../units.service';
import {Subscription} from 'rxjs';
import {Unit} from '../../models/unit';
import {Device} from '../../models/device';
import {collection, Firestore, getDocs, query, where} from '@angular/fire/firestore';
import {LoadingController, ToastController} from '@ionic/angular';

@Component({
	selector: 'app-detail-unit',
	templateUrl: './detail-unit.component.html',
	styleUrls: ['./detail-unit.component.scss'],
})
export class DetailUnitComponent implements OnInit, OnDestroy {
	unit: Unit = null;
	unitInitialDevice: Device = null;
	availableDevices: Device[] = [];

	selectedDevice: Device = null;

	constructor(private readonly route: ActivatedRoute, private readonly unitsService: UnitsService,
	            private readonly firestore: Firestore, private readonly loadingController: LoadingController,
	            private readonly toastController: ToastController) {
	}

	ngOnInit() {
		this.init();
	}

	init() {
		this.unit = null;
		this.unitInitialDevice = null;
		this.availableDevices = [];
		this.selectedDevice = null;

		const unitId = this.route.snapshot.paramMap.get('unitId');

		let loader: HTMLIonLoadingElement;
		this.loadingController.create().then(async r => {
			loader = r;
			await loader.present();
		});

		this.getUnit(unitId).then(() => {
			console.log('Got unit');
			this.getFreeDevicesList().then(async r => {
				console.log('Unit: ', this.unit);
				console.log('Initial device: ', this.unitInitialDevice);
				console.log('Available devices: ', this.availableDevices);
				await loader.dismiss();
			});
		});
	}

	async getUnit(unitId: string) {
		const unitObs = await this.unitsService.getUnitById(parseInt(unitId, 10)).toPromise();
		const unit = await unitObs.toPromise();

		this.unit = unit;
		console.log('Unit: ', this.unit);

		if (this.unit.devices.length > 0) {
			const device = await this.unitsService.getDeviceByImeiFromFirestore(this.unit.devices[0].imei);
			this.unitInitialDevice = device;
			this.selectedDevice = device;
		}
	}

	async getFreeDevicesList() {
		this.availableDevices = await this.unitsService.getFreeDevices();
	}

	ngOnDestroy() {
	}

	async saveChanges() {
		let loader: HTMLIonLoadingElement;
		this.loadingController.create().then(async r => {
			loader = r;
			await loader.present();
		});

		if (this.unitInitialDevice && this.unitInitialDevice.id !== this.selectedDevice.id) {
			await this.unitsService.updateDevice(this.unit.id, this.unitInitialDevice, this.selectedDevice);
		} else if (this.unitInitialDevice == null && this.selectedDevice) {
			await this.unitsService.assignDevice(this.unit.id, this.selectedDevice);
		}

		await loader.dismiss();

		this.init();
	}

	async removeDevice() {
		let loader: HTMLIonLoadingElement;
		this.loadingController.create().then(async r => {
			loader = r;
			await loader.present();
		});

		await this.unitsService.removeDevice(this.unit.id, this.unitInitialDevice);

		await loader.dismiss();

		await this.init();
	}

	async showErrorToast(message: string) {
		const toast = await this.toastController.create({
			message,
			duration: 2000
		});
		await toast.present();
		this.init();
	}
}
