import {Injectable} from '@angular/core';
import {doc, docData, Firestore, setDoc, Timestamp} from '@angular/fire/firestore';
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
}
