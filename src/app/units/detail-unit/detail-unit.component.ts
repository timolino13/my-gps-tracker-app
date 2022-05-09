import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UnitsService} from '../units.service';
import {Subscription, timer} from 'rxjs';
import {Unit} from '../../models/unit';
import {FirebaseDevice} from '../../models/firebase-device';

@Component({
	selector: 'app-detail-unit',
	templateUrl: './detail-unit.component.html',
	styleUrls: ['./detail-unit.component.scss'],
})
export class DetailUnitComponent implements OnInit, OnDestroy {
	unit: Unit = null;
	devices: FirebaseDevice[] = null;

	selectedDeviceId: number;

	private unitSubscription: Subscription;

	constructor(private readonly route: ActivatedRoute, private readonly unitsService: UnitsService) {
	}

	ngOnInit() {
		const unitId = this.route.snapshot.paramMap.get('unitId');

		this.unitSubscription = timer(0, 10000).subscribe(() => {
			this.getUnit(unitId);
		});

		this.getDevicesList();
	}

	getUnit(unitId: string) {
		this.unitsService.getUnitById(parseInt(unitId, 10)).subscribe(async value => {
				this.unit = await value;
				console.log('Unit', this.unit);
				if (this.unit.devices.length > 0) {
					this.selectedDeviceId = this.unit.devices[0].id;
				}
			}
		);
	}

	getDevicesList() {
		return this.unitsService.getAllDevices$().subscribe(devices => {
			console.log('Devices', devices);
			this.devices = devices;
		});
	}

	unsubscribe() {
		if (this.unitSubscription) {
			this.unitSubscription.unsubscribe();
			console.log('UnitTimer unsubscribed');
		}
	}

	ngOnDestroy() {
		this.unsubscribe();
	}

	changeDevice() {

	}
}
