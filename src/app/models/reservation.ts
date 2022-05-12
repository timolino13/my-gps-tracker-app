import {FirestoreTimestamp} from './firestore-timestamp';
import {Unit} from './unit';
import {UserDocument} from './user-document';
import {Timestamp} from '@angular/fire/firestore';

export class Reservation {
	id?: number;
	unitId: number;
	unitName: string;
	unit?: Unit;
	userRef: string;
	user?: UserDocument;
	startTime: Timestamp;
	endTime: FirestoreTimestamp;
}
