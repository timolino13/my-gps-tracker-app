import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UnitsService} from '../units.service';
import {Subscription, timer} from 'rxjs';
import {Unit} from '../../models/unit';
import {FirebaseDevice} from '../../models/firebase-device';
import {collection, Firestore, onSnapshot, query, where} from '@angular/fire/firestore';
import {Device} from '../../models/device';

@Component({
	selector: 'app-detail-unit',
	templateUrl: './detail-unit.component.html',
	styleUrls: ['./detail-unit.component.scss'],
})
export class DetailUnitComponent implements OnInit, OnDestroy {
	unit: Unit = null;
	devices: FirebaseDevice[] = [];

	selectedDevice: FirebaseDevice;

	private unitSubscription: Subscription;
	private devicesSubscription: Subscription;

	constructor(private readonly route: ActivatedRoute, private readonly unitsService: UnitsService) {
	}

	ngOnInit() {
		const unitId = this.route.snapshot.paramMap.get('unitId');

		this.unitSubscription = timer(0, 10000).subscribe(() => {
			this.getUnit(unitId);
		});

		this.devicesSubscription = this.getDevicesList();
	}

	getUnit(unitId: string) {
		this.unitsService.getUnitById(parseInt(unitId, 10)).subscribe(async value => {
				this.unit = await value;

				if (this.unit.devices.length > 0) {
					this.selectedDevice = this.unit.devices[0] as FirebaseDevice;
				}
			}
		);
	}

	getDevicesList() {
		return this.unitsService.getAllDevices$().subscribe(value => {
			this.devices = value;
		});
	}

	unsubscribe() {
		if (this.unitSubscription) {
			this.unitSubscription.unsubscribe();
			console.log('UnitTimer unsubscribed');
		}
		if (this.devicesSubscription) {
			this.devicesSubscription.unsubscribe();
			console.log('DevicesList unsubscribed');
		}
	}

	ngOnDestroy() {
		this.unsubscribe();
	}

	saveChanges() {
		if (this.unit && this.unit.devices.length > 0 && this.unit.devices[0].id !== this.selectedDevice.id) {
			this.unitsService.updateDevice(this.unit.id, this.unit.devices[0], this.selectedDevice);
		} else if (this.unit && this.unit.devices.length === 0 && this.selectedDevice) {
			this.unitsService.assignDevice(this.unit.id, this.selectedDevice);
		}
	}
}
