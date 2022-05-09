import {Component, OnDestroy, OnInit} from '@angular/core';
import {UnitsService} from './units.service';
import {Auth, onAuthStateChanged} from '@angular/fire/auth';
import {UnitInterface} from '../models/interfaces/unit-interface';
import {Subscription, timer} from 'rxjs';

@Component({
	selector: 'app-units',
	templateUrl: './units.page.html',
	styleUrls: ['./units.page.scss'],
})
export class UnitsPage implements OnInit, OnDestroy {
	unitsList$: UnitInterface[];
	private timer: Subscription;


	constructor(private readonly auth: Auth, private readonly unitsService: UnitsService) {
	}

	ngOnInit() {
		this.timer = timer(0, 60000).subscribe(() => {
			console.log('Refreshing units list');
			this.getUnits();
		});
	}

	getUnits() {
		onAuthStateChanged(this.auth, (user) => {
			if (user) {
				this.unitsService.getUnits().subscribe(async value => {
						this.unitsList$ = await value;
						console.log('Units list', this.unitsList$);
					}
				);
			}
		});
	}

	ngOnDestroy() {
		if (this.timer) {
			this.timer.unsubscribe();
		}
	}
}
