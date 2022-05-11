import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UnitsService} from '../units.service';
import {Unit} from '../../models/unit';
import {Device} from '../../models/device';
import {Firestore} from '@angular/fire/firestore';
import {AlertController, LoadingController, ToastController, ViewWillEnter} from '@ionic/angular';

@Component({
	selector: 'app-detail-unit',
	templateUrl: './detail-unit.component.html',
	styleUrls: ['./detail-unit.component.scss'],
})
export class DetailUnitComponent implements OnInit, ViewWillEnter {
	unit: Unit = null;
	unitInitialDevice: Device = null;
	availableDevices: Device[] = [];

	selectedDevice: Device = null;
	noDevice: Device = new Device('No device', 0, false, 0, 0);

	constructor(private readonly route: ActivatedRoute, private readonly unitsService: UnitsService,
	            private readonly firestore: Firestore, private readonly loadingController: LoadingController,
	            private readonly toastController: ToastController, private readonly alertController: AlertController,
	            private readonly router: Router) {
	}

	ngOnInit() {
	}

	ionViewWillEnter() {
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
		this.unit = await unitObs.toPromise();
		console.log('Unit: ', this.unit);

		if (this.unit.devices.length > 0) {
			const device = await this.unitsService.getDeviceByImeiFromFirestore(this.unit.devices[0].imei);
			this.unitInitialDevice = device;
			this.selectedDevice = device;
		} else {
			this.selectedDevice = this.noDevice;
		}
	}

	async getFreeDevicesList() {
		this.availableDevices = await this.unitsService.getFreeDevices();
	}

	async saveChanges() {
		let loader: HTMLIonLoadingElement;
		this.loadingController.create().then(async r => {
			loader = r;
			await loader.present();
		});

		if (this.isRemove()) {
			await this.unitsService.removeDevice(this.unit.id, this.unitInitialDevice);
		} else if (this.isUpdate()) {
			await this.unitsService.updateDevice(this.unit.id, this.unitInitialDevice, this.selectedDevice);
		} else if (this.isAssign()) {
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

	async showToast(message: string) {
		const toast = await this.toastController.create({
			message,
			duration: 2000
		});
		await toast.present();
		this.init();
	}

	async presentSaveAlertConfirm() {
		const alert = await this.alertController.create({
			cssClass: 'my-custom-class',
			header: 'Save changes',
			message: 'Are you sure you want to the changes?',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					cssClass: 'secondary',
					id: 'cancel-button',
					handler: (blah) => {
						console.log('Confirm Cancel: blah', blah);
					}
				}, {
					text: 'Okay',
					id: 'confirm-button',
					handler: () => {
						console.log('Confirm Okay');
						this.saveChanges();
					}
				}
			]
		});

		await alert.present();
	}

	async presentDiscardAlertConfirm() {
		const alert = await this.alertController.create({
			cssClass: 'my-custom-class',
			header: 'Discard changes',
			message: 'Are you sure you want to discard the changes?',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					cssClass: 'secondary',
					id: 'cancel-button',
					handler: (blah) => {
						console.log('Confirm Cancel: blah', blah);
					}
				}, {
					text: 'Yes',
					id: 'confirm-button',
					handler: async () => {
						console.log('Confirm Okay');
						await this.router.navigate(['/units']);
					}
				}
			]
		});

		await alert.present();
	}

	showSaveButton(): boolean {
		return this.isUpdate() || this.isAssign() || this.isRemove();
	}

	isRemove(): boolean {
		return this.unitInitialDevice && this.unitInitialDevice.imei !== 'No device' && this.selectedDevice.imei === 'No device';
	}

	isAssign(): boolean {
		return this.unitInitialDevice == null && this.selectedDevice && this.selectedDevice.imei !== 'No device';
	}

	isUpdate(): boolean {
		return this.unitInitialDevice && this.unitInitialDevice.imei !== 'No device' && this.selectedDevice.imei !== 'No device'
			&& this.unitInitialDevice.id !== this.selectedDevice.id;
	}

	async goBack() {
		if (this.showSaveButton()) {
			await this.presentDiscardAlertConfirm();
		} else {
			await this.router.navigate(['/units']);
		}
	}
}
