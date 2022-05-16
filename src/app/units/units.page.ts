import {Component, OnDestroy, OnInit} from '@angular/core';
import {UnitsService} from '../services/units.service';
import {Auth, onAuthStateChanged} from '@angular/fire/auth';
import {Subscription, timer} from 'rxjs';
import {Unit} from '../models/unit';
import {LoadingController, ViewWillEnter, ViewWillLeave} from '@ionic/angular';

@Component({
	selector: 'app-units',
	templateUrl: './units.page.html',
	styleUrls: ['./units.page.scss'],
})
export class UnitsPage implements OnInit, OnDestroy, ViewWillEnter, ViewWillLeave {
	unitsList: Unit[] = [];
	searchTerm: any;

	unfilteredUnitsList: Unit[] = [];

	private timer: Subscription;
	private loading: HTMLIonLoadingElement;

	constructor(private readonly auth: Auth, private readonly unitsService: UnitsService, private readonly loadingCtrl: LoadingController) {
	}

	ngOnInit() {
	}

	getUnits() {
		const sub = onAuthStateChanged(this.auth, async (user) => {
			if (user) {
				this.unitsList = await this.unitsService.getUnits().toPromise();
				this.unfilteredUnitsList = this.unitsList;
				sub();
			}
		});
	}

	ngOnDestroy() {
	}

	ionViewWillEnter() {
		this.presentLoading('Loading...').then(async r => {
			this.loading = r;
			this.timer = timer(0, 60000).subscribe(() => {
			});
			console.log('Refreshing units list');
			this.getUnits();
			await this.dismissLoading(this.loading);
		});
	}

	ionViewWillLeave() {
		if (this.timer) {
			this.timer.unsubscribe();
			console.log('Units list unsubscribed');
		}
	}

	async presentLoading(message?: string): Promise<HTMLIonLoadingElement> {
		const load = await this.loadingCtrl.create({
			message: message ? message : 'Loading...',
		});
		await load.present();
		return load;
	}

	async dismissLoading(load: HTMLIonLoadingElement) {
		if (load) {
			await load.dismiss();
		}
	}

	search() {
		if (this.searchTerm) {
			this.unitsList = this.unfilteredUnitsList.filter(unit => unit.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
				(unit.devices.length > 0 && unit.devices[0].imei.toLowerCase().includes(this.searchTerm.toLowerCase())));
		} else {
			this.unitsList = this.unfilteredUnitsList;
		}
	}
}
