import {Component, OnInit} from '@angular/core';
import {AuthService} from '../authentication/auth.service';
import {ReservationsService} from './reservations.service';
import {Reservation} from '../models/reservation';
import {collection, doc, Firestore, onSnapshot, query, where} from '@angular/fire/firestore';
import {UnitsService} from '../units/units.service';
import {LoadingController} from '@ionic/angular';


@Component({
	selector: 'app-reservations',
	templateUrl: './reservations.page.html',
	styleUrls: ['./reservations.page.scss'],
})
export class ReservationsPage implements OnInit {
	futureReservations: Reservation[] = [];
	activeReservation: Reservation;

	loading: HTMLIonLoadingElement;

	constructor(private readonly authService: AuthService, private readonly reservationsService: ReservationsService,
	            private readonly firestore: Firestore, private readonly unitService: UnitsService,
	            private readonly loadingController: LoadingController) {
	}

	ngOnInit() {
		this.init();
	}

	async init() {
		this.loading = await this.presentLoading('Loading reservations...');
		this.getFutureReservationsByUserId();
		this.getActiveReservationByUserId();
	}

	getFutureReservationsByUserId() {
		console.log('ReservationsPage.getReservationsByUserId');
		this.authService.getCurrentUser$().subscribe(async user => {
			if (user) {
				console.log('ReservationsPage.getReservationsByUserId.user', user);
				const userRef = doc(this.firestore, `users/${user.uid}`);
				const q = query(
					collection(this.firestore, 'reservations'),
					where('userRef', '==', userRef),
					where('startTime', '>=', new Date()),
				);

				onSnapshot(q, (querySnapshot) => {
					const reservations: Reservation[] = [];
					querySnapshot.forEach(async (d) => {
						const reservation = d.data() as Reservation;
						const unitResObs = await this.unitService.getUnitById(reservation.unitId).toPromise();
						reservation.unit = await unitResObs.toPromise();
						reservations.push(reservation);
					});
					console.log('ReservationsPage.getReservationsByUserId.reservations', reservations);
					this.futureReservations = reservations;
				});
			}
		});
	}

	getActiveReservationByUserId() {
		this.authService.getCurrentUser$().subscribe(async user => {
			if (user) {
				const userRef = doc(this.firestore, `users/${user.uid}`);
				const q = query(
					collection(this.firestore, 'reservations'),
					where('userRef', '==', userRef),
					where('startTime', '<=', new Date()),
				);

				onSnapshot(q, (querySnapshot) => {
					const activeReservations: Reservation[] = [];
					querySnapshot.forEach(async (d) => {
						const reservation = d.data() as Reservation;
						console.log('ReservationsPage.getActiveReservationByUserId.reservation', reservation);
						if (reservation.endTime.toDate().getTime() >= new Date().getTime()) {
							const unitResObs = await this.unitService.getUnitById(reservation.unitId).toPromise();
							reservation.unit = await unitResObs.toPromise();
							this.activeReservation = reservation;
							console.log(this.activeReservation);
						}
					});
				});
				await this.dismissLoading(this.loading);
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
}
