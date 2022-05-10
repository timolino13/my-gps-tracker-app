import {FirestoreTimestamp} from './firestore-timestamp';
import {Unit} from './unit';

export class Reservation {
	id: number;
	unitId: number;
	unit?: Unit;
	userRef: number;
	startTime: FirestoreTimestamp;
	endTime: FirestoreTimestamp;
}
