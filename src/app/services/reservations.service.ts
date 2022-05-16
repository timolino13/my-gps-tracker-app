import {Injectable} from '@angular/core';
import {addDoc, collection, doc, docData, Firestore, getDocs, query, updateDoc, where} from '@angular/fire/firestore';
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

	async getFutureReservationsByUnitId(unitId: number): Promise<Reservation[]> {
		const q = query(
			collection(this.firestore, 'reservations'),
			where('unitId', '==', unitId),
			where('endTime', '>', new Date())
		);

		const querySnapshot = await getDocs(q);

		const reservations: Reservation[] = [];
		querySnapshot.forEach(document => {
			const reservation = document.data() as Reservation;
			reservation.id = document.id;
			reservations.push(reservation);
		});

		return reservations;
	}

	async getFutureReservationsByUserId(userId: string): Promise<Reservation[]> {
		const q = query(
			collection(this.firestore, 'reservations'),
			where('userId', '==', userId),
			where('endTime', '>', new Date())
		);

		const querySnapshot = await getDocs(q);

		const reservations: Reservation[] = [];
		querySnapshot.forEach(document => {
			const reservation = document.data() as Reservation;
			reservation.id = document.id;
			reservations.push(reservation);
		});

		return reservations;
	}

	isReserved(reservation: Reservation, startTime: Date, endTime: Date) {
		if ((reservation.startTime.toDate().getTime() <= startTime.getTime() &&
				reservation.endTime.toDate().getTime() >= endTime.getTime()) ||
			(reservation.startTime.toDate().getTime() >= startTime.getTime() &&
				reservation.startTime.toDate().getTime() <= endTime.getTime()) ||
			(reservation.endTime.toDate().getTime() >= startTime.getTime() &&
				reservation.endTime.toDate().getTime() <= endTime.getTime()) ||
			(reservation.startTime.toDate().getTime() <= startTime.getTime() &&
				reservation.endTime.toDate().getTime() >= endTime.getTime())) {
			console.log('unit already reserved', reservation);
			return true;
		}
		return false;
	}
}
