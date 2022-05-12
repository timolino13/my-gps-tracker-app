import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Reservation} from '../../../models/reservation';
import {ReservationsService} from '../../../reservations/reservations.service';
import {Unit} from '../../../models/unit';
import {collection, Firestore, onSnapshot, query, where} from '@angular/fire/firestore';
import {AuthService} from '../../../authentication/auth.service';
import {LoadingController} from '@ionic/angular';
import {UsersService} from '../../../services/users.service';
import {timer} from 'rxjs';

@Component({
	selector: 'app-list-unit-reservations',
	templateUrl: './list-unit-reservations.component.html',
	styleUrls: ['./list-unit-reservations.component.scss'],
})
export class ListUnitReservationsComponent implements OnInit {

	unitId: number;
	unit: Unit;
	activeReservation: Reservation;
	futureReservations: Reservation[];

	loading: HTMLIonLoadingElement;

	constructor(private readonly route: ActivatedRoute, private readonly reservationService: ReservationsService,
	            private readonly authService: AuthService, private readonly firestore: Firestore,
	            private readonly loadingController: LoadingController, private readonly usersService: UsersService,
	            private readonly router: Router) {
	}

	ngOnInit() {
		this.unitId = parseInt(this.route.snapshot.paramMap.get('unitId'), 10);
		console.log('unitId: ', this.unitId);
		this.init();
	}

	async init() {
		this.loading = await this.presentLoading('Loading reservations...');
		this.getFutureReservationsByUnitId();
		await this.getActiveReservationByUnitId();
	}

	getFutureReservationsByUnitId() {
		const q = query(
			collection(this.firestore, 'reservations'),
			where('unitId', '==', this.unitId),
			where('startTime', '>=', new Date())
		);

		onSnapshot(q, (querySnapshot) => {
			const reservations: Reservation[] = [];
			console.log('querySnapshot: ', querySnapshot);
			querySnapshot.forEach(async (d) => {
				const reservation = d.data() as Reservation;
				reservation.user = await this.usersService.getUserDataByUserRef(reservation.userRef);
				reservations.push(reservation);
			});

			this.futureReservations = reservations;
		});
	}

	async getActiveReservationByUnitId() {
		console.log('getActiveReservationByUnitId', this.unitId);
		const q = query(
			collection(this.firestore, 'reservations'),
			where('unitId', '==', this.unitId),
			where('startTime', '<=', new Date()),
		);

		onSnapshot(q, (querySnapshot) => {
			querySnapshot.forEach(async (d) => {
				const reservation = d.data() as Reservation;
				if (reservation.endTime.toDate().getTime() >= new Date().getTime()) {
					reservation.user = await this.usersService.getUserDataByUserRef(reservation.userRef);
					this.activeReservation = reservation;
				}
			});
		});
		await this.dismissLoading(this.loading);
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
