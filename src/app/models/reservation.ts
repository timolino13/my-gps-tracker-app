import {FirestoreTimestamp} from './firestore-timestamp';

export class Reservation {
	id: number;
	deviceId: number;
	userId: number;
	startTime: FirestoreTimestamp;
	endTime: FirestoreTimestamp;
}
