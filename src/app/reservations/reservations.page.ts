import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {ReservationsService} from '../services/reservations.service';
import {Reservation} from '../models/reservation';
import {collection, doc, Firestore, onSnapshot, query, where} from '@angular/fire/firestore';
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
	}

	getFutureReservationsByUserId() {
		this.authService.getCurrentUser$().subscribe(async user => {
			console.log('userUpdate', user);
			if (user) {
				const q = query(
					collection(this.firestore, 'reservations'),
					where('userId', '==', user.uid),
					where('endTime', '>', new Date())
				);

				this.unsub = onSnapshot(q, (querySnapshot) => {
					const reservations: Reservation[] = [];
					querySnapshot.forEach(async (d) => {
						const reservation = d.data() as Reservation;
						reservation.id = d.id;
						const unitResObs = await this.unitService.getUnitById(reservation.unitId).toPromise();
						reservation.unit = await unitResObs.toPromise();
						reservations.push(reservation);
					});
					this.futureReservations = reservations;
					this.unfilteredReservations = reservations;
					this.dismissLoading(this.loading);
				});
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
