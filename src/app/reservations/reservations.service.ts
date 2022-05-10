import {Injectable} from '@angular/core';
import {collection, doc, docData, Firestore, onSnapshot, query, where} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {Reservation} from '../models/reservation';
import {FirestoreTimestamp} from '../models/firestore-timestamp';

@Injectable({
	providedIn: 'root'
})
export class ReservationsService {

	constructor(private readonly firestore: Firestore) {
	}

	getReservation$(id: string): Observable<Reservation> {
		const userDocRef = doc(this.firestore, `reservations/${id}`);
		return docData(userDocRef, {idField: 'id'}) as Observable<Reservation>;
	}
}
