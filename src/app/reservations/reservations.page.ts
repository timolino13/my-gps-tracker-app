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

	changedOrder = false;

	constructor(private readonly authService: AuthService, private readonly reservationsService: ReservationsService,
	            private readonly firestore: Firestore, private readonly unitService: UnitsService,
	            private readonly loadingController: LoadingController) {
	}

	ngOnInit() {
		this.init();
	}

	ngOnDestroy() {
	}

	async doRefresh(event) {
		await this.init();
		event.target.complete();
	}

	search() {
		if (this.searchTerm) {
			this.futureReservations = this.unfilteredReservations
				.filter(reservation => reservation.unitName.toLowerCase().includes(this.searchTerm.toLowerCase()));
		} else {
			this.futureReservations = this.unfilteredReservations;
		}
	}

	reverse() {
		this.changedOrder = !this.changedOrder;
		this.futureReservations.reverse();
	}

	private async init() {
		this.loading = await this.presentLoading('Loading reservations...');
		this.getFutureReservationsByUserId();
		await this.dismissLoading(this.loading);
	}

	private getFutureReservationsByUserId() {
		this.authService.getCurrentUser$().subscribe(async user => {
			if (user) {
				this.futureReservations = await this.reservationsService.getFutureReservationsByUserId(user.uid);

				this.futureReservations.sort(this.compare);

				this.unfilteredReservations = this.futureReservations;
			}
		});
	}

	private compare(a, b) {
		if (a.unitName < b.unitName) {
			return -1;
		}
		if (a.unitName > b.unitName) {
			return 1;
		}
		return 0;
	}

	private async presentLoading(message?: string): Promise<HTMLIonLoadingElement> {
		const loading = await this.loadingController.create({
			message: message ? message : 'Loading...',
		});
		await loading.present();
		return loading;
	}

	private async dismissLoading(loading: HTMLIonLoadingElement) {
		if (loading) {
			await loading.dismiss();
		}
	}
}
