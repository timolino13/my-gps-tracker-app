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
	futureReservations: Reservation[];

	unfilteredReservations: Reservation[];

	loading: HTMLIonLoadingElement;
	searchTerm: any;

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
		this.getFutureReservationsByUnitId$();
	}

	getFutureReservationsByUnitId$() {
		const q = query(
			collection(this.firestore, 'reservations'),
			where('unitId', '==', this.unitId),
			where('endTime', '>', new Date())
		);

		onSnapshot(q, (querySnapshot) => {
			const reservations: Reservation[] = [];
			console.log('querySnapshot: ', querySnapshot);
			querySnapshot.forEach(async (d) => {
				const reservation = d.data() as Reservation;
				reservation.id = d.id;
				reservation.user = await this.usersService.getUserDataByUserId(reservation.userId);
				reservations.push(reservation);
			});

			this.futureReservations = reservations;
			this.unfilteredReservations = reservations;
			this.dismissLoading(this.loading);
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
			this.futureReservations = this.unfilteredReservations.filter(reservation => reservation.user.email.toLowerCase().includes(this.searchTerm.toLowerCase()));
		} else {
			this.futureReservations = this.unfilteredReservations;
		}
	}
}
