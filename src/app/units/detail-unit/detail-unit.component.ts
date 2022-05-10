import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UnitsService} from '../units.service';
import {Subscription} from 'rxjs';
import {Unit} from '../../models/unit';
import {Device} from '../../models/device';
import {collection, Firestore, getDocs, query, where} from '@angular/fire/firestore';
import {LoadingController} from '@ionic/angular';

@Component({
	selector: 'app-detail-unit',
	templateUrl: './detail-unit.component.html',
	styleUrls: ['./detail-unit.component.scss'],
})
export class DetailUnitComponent implements OnInit, OnDestroy {
	unit: Unit = null;
	unitInitialDevice: Device = null;
	availableDevices: Device[] = [];

	selectedDevice: Device;

	constructor(private readonly route: ActivatedRoute, private readonly unitsService: UnitsService,
	            private readonly firestore: Firestore, private readonly loadingController: LoadingController) {
	}

	ngOnInit() {
		this.init();
	}

	init() {
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

		console.log('Unit: ', unit);
		this.unit = unit;

		if (this.unit.devices.length > 0) {
			const device = await this.unitsService.getDeviceByImeiFromFirestore(this.unit.devices[0].imei);
			this.unitInitialDevice = device;
			this.selectedDevice = device;
		}
	}

	async getFreeDevicesList() {
		const devicesRef = collection(this.firestore, 'devices');

		// Create a query against the collection.
		const q = query(devicesRef, where('assigned', '==', false));

		const querySnapshot = await getDocs(q);
		querySnapshot.forEach((doc) => {
			console.log(doc.data());
			this.availableDevices.push(doc.data() as Device);
		});
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
		await this.unitsService.removeDevice(this.unit.id, this.unitInitialDevice);
	}
}
