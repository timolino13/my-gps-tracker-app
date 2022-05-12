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

	constructor(unitId: number, unitName: string, userRef: string, startTime: Timestamp, endTime: FirestoreTimestamp) {
		this.unitId = unitId;
		this.unitName = unitName;
		this.userRef = userRef;
		this.startTime = startTime;
		this.endTime = endTime;
	}
}
