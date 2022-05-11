import {FirestoreTimestamp} from './firestore-timestamp';
import {Unit} from './unit';

export class Reservation {
	id: number;
	unitId: number;
	unitName: string;
	unit?: Unit;
	userRef: number;
	startTime: FirestoreTimestamp;
	endTime: FirestoreTimestamp;
}
