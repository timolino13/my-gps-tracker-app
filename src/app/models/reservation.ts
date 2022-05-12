import {Unit} from './unit';
import {UserDocument} from './user-document';
import {Timestamp} from '@angular/fire/firestore';

export class Reservation {
	id?: number;
	unitId: number;
	unitName: string;
	unit?: Unit;
	userId: string;
	user?: UserDocument;
	startTime: Timestamp;
	endTime: Timestamp;

	constructor(unitId: number, unitName: string, userId: string, startTime: Timestamp, endTime: Timestamp) {
		this.unitId = unitId;
		this.unitName = unitName;
		this.userId = userId;
		this.startTime = startTime;
		this.endTime = endTime;
	}
}
