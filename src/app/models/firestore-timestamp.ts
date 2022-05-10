export class FirestoreTimestamp {
	nanoseconds: number;
	seconds: number;

	constructor(nanoseconds: number, seconds: number) {
		this.nanoseconds = nanoseconds;
		this.seconds = seconds;
	}

	fromDate(date: Date): FirestoreTimestamp {
		return new FirestoreTimestamp(date.getTime() * 1000000, date.getTime() / 1000);
	}

	fromMillis(milliseconds: number): FirestoreTimestamp {
		return new FirestoreTimestamp(milliseconds * 1000000, milliseconds / 1000);
	}

	toDate(): Date {
		return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
	}

	toMillis(): number {
		return this.seconds * 1000 + this.nanoseconds / 1000000;
	}
}
