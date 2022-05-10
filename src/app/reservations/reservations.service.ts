import {Injectable} from '@angular/core';
import {collection, doc, docData, Firestore, onSnapshot, query} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {Reservation} from '../models/reservation';

@Injectable({
	providedIn: 'root'
})
export class ReservationsService {

	constructor(private readonly firestore: Firestore) {
	}

	getReservations(): Observable<Reservation[]> {
		return new Observable<Reservation[]>(subscriber => {
			const q = query(collection(this.firestore, 'reservations'));
			onSnapshot(q, (snapshot) => {
				const reservations: Reservation[] = [];
				snapshot.forEach(docSnap => reservations.push(docSnap.data() as Reservation));
				subscriber.next(reservations);
			});
		});
	}

	getReservation(id: string): Observable<Reservation> {
		const userDocRef = doc(this.firestore, `reservations/${id}`);
		return docData(userDocRef, {idField: 'id'}) as Observable<Reservation>;
	}
}
