import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {ReservationsService} from '../services/reservations.service';
import {Reservation} from '../models/reservation';
import {Firestore} from '@angular/fire/firestore';
import {UnitsService} from '../services/units.service';
import {LoadingController} from '@ionic/angular';


@Component({
	selector: 'app-reservations',
	templateUrl: './reservations.page.html',
	styleUrls: ['./reservations.page.scss'],
})
export class ReservationsPage implements OnInit, OnDestroy {
	futureReservations: Reservation[] = [];

	loading: HTMLIonLoadingElement;

	unfilteredReservations: Reservation[] = [];

	searchTerm: any;
	private unsub;

	constructor(private readonly authService: AuthService, private readonly reservationsService: ReservationsService,
	            private readonly firestore: Firestore, private readonly unitService: UnitsService,
	            private readonly loadingController: LoadingController) {
	}

	ngOnInit() {
		this.init();
	}

	ngOnDestroy() {
		if (this.unsub) {
			this.unsub();
		}
	}

	async init() {
		this.loading = await this.presentLoading('Loading reservations...');
		this.getFutureReservationsByUserId();
		await this.dismissLoading(this.loading);
	}

	getFutureReservationsByUserId() {
		this.authService.getCurrentUser$().subscribe(async user => {
			if (user) {
				this.futureReservations = await this.reservationsService.getFutureReservationsByUserId(user.uid);

				for (const reservation of this.futureReservations) {
					const unitResObs = await this.unitService.getUnitById$(reservation.unitId).toPromise();
					reservation.unit = await unitResObs.toPromise();
				}

				console.log(this.futureReservations);

				this.unfilteredReservations = this.futureReservations;
			}
		});
	}

	async presentLoading(message?: string): Promise<HTMLIonLoadingElement> {
		const loading = await this.loadingController.create({
			message: message ? message : 'Loading...',
		});
		await loading.present();
		return loading;
	}

	async dismissLoading(loading: HTMLIonLoadingElement) {
		if (loading) {
			await loading.dismiss();
		}
	}

	search() {
		if (this.searchTerm) {
			this.futureReservations = this.unfilteredReservations.filter(reservation => reservation.unit.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
		} else {
			this.futureReservations = this.unfilteredReservations;
		}
	}
}
