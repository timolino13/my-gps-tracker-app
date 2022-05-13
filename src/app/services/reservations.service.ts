import {Injectable} from '@angular/core';
import {addDoc, collection, doc, docData, Firestore, updateDoc} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {Reservation} from '../models/reservation';

@Injectable({
	providedIn: 'root'
})
export class ReservationsService {

	constructor(private readonly firestore: Firestore) {
	}

	getReservationById$(userId: string): Observable<Reservation> {
		const userDocRef = doc(this.firestore, `reservations/${userId}`);
		return docData(userDocRef, {idField: 'id'}) as Observable<Reservation>;
	}

	async createReservation$(reservation: Reservation): Promise<Observable<Reservation>> {

		const reservationDocRef = addDoc(collection(this.firestore, 'reservations'), {
			unitName: reservation.unitName,
			unitId: reservation.unitId,
			userId: reservation.userId,
			startTime: reservation.startTime,
			endTime: reservation.endTime,
		});

		return docData(await reservationDocRef, {idField: 'id'}) as Observable<Reservation>;
	}

	async updateReservation$(reservation: Reservation) {

		const docRef = doc(this.firestore, `reservations/${reservation.id}`);
		return await updateDoc(docRef, {
			userId: reservation.userId,
			startTime: reservation.startTime,
			endTime: reservation.endTime,
		});
	}
}
