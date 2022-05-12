import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ReservationsService} from '../../../reservations/reservations.service';
import {UsersService} from '../../../services/users.service';
import {collection, doc, Firestore, onSnapshot, query, Timestamp, where} from '@angular/fire/firestore';
import {UserDocument} from '../../../models/user-document';
import {Reservation} from '../../../models/reservation';
import {UnitsService} from '../../units.service';
import {Unit} from '../../../models/unit';

@Component({
	selector: 'app-create-unit-reservation',
	templateUrl: './create-unit-reservation.component.html',
	styleUrls: ['./create-unit-reservation.component.scss'],
})
export class CreateUnitReservationComponent implements OnInit {

	unitId: number;
	now: Date = new Date();
	endTime: string;

	startTime: string;
	selectedUser: UserDocument;
	users: UserDocument[];

	private unit: Unit;

	constructor(private readonly route: ActivatedRoute, private readonly reservationsService: ReservationsService,
	            private readonly usersService: UsersService, private readonly firestore: Firestore,
	            private readonly unitsService: UnitsService, private readonly router: Router) {
	}

	ngOnInit() {
		this.unitId = parseInt(this.route.snapshot.paramMap.get('unitId'), 10);
		this.getUsers();
		this.getUnit();

	}

	async reserve() {
		if (this.valid()) {
			console.log(this.selectedUser, this.startTime, this.endTime);
			const reservation = new Reservation(
				this.unitId,
				this.unit.name,
				this.selectedUser.id,
				Timestamp.fromDate(new Date(this.startTime)),
				Timestamp.fromDate(new Date(this.endTime))
			);
			const res = await this.reservationsService.createReservation$(reservation);

			res.subscribe((r) => {
				console.log('reservation created', r);
			});

		}
	}

	getUsers() {
		const q = query(
			collection(this.firestore, 'users')
		);

		onSnapshot(q, (querySnapshot) => {
			const users: UserDocument[] = [];

			querySnapshot.forEach(async (d) => {
				const u = d.data() as UserDocument;

				users.push(u);
			});

			this.users = users;
		});
	}

	validStartTime() {
		return this.startTime && this.startTime > this.now.toISOString() && this.startTime < this.endTime;
	}

	validEndTime() {
		return this.endTime && this.endTime > this.startTime && this.endTime > this.now.toISOString();
	}

	valid() {
		return this.selectedUser && this.validStartTime() && this.validEndTime();
	}

	private async getUnit() {
		const unitObs = await this.unitsService.getUnitById(this.unitId).toPromise();
		this.unit = await unitObs.toPromise();

		console.log('Unit: ', this.unit);
	}
}
