import {Component, OnInit} from '@angular/core';
import {AuthService} from '../authentication/auth.service';
import {ReservationsService} from './reservations.service';
import {Reservation} from '../models/reservation';
import {collection, doc, Firestore, onSnapshot, query, where} from '@angular/fire/firestore';
import {UnitsService} from '../units/units.service';


@Component({
	selector: 'app-reservations',
	templateUrl: './reservations.page.html',
	styleUrls: ['./reservations.page.scss'],
})
export class ReservationsPage implements OnInit {
	reservations: Reservation[] = [];

	constructor(private readonly authService: AuthService, private readonly reservationsService: ReservationsService,
	            private readonly firestore: Firestore, private readonly unitService: UnitsService) {
	}

	ngOnInit() {
		console.log('ReservationsPage.ngOnInit');
		this.getFutureReservationsByUserId();
	}

	getFutureReservationsByUserId() {
		console.log('ReservationsPage.getReservationsByUserId');
		this.authService.getCurrentUser$().subscribe(user => {
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
					this.reservations = reservations;
				});
			}
		});
	}
}
