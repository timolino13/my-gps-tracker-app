import {Component, OnInit} from '@angular/core';
import {UserDocument} from '../../../models/user-document';
import {Unit} from '../../../models/unit';
import {Reservation} from '../../../models/reservation';
import {ActivatedRoute, Router} from '@angular/router';
import {ReservationsService} from '../../../services/reservations.service';
import {UsersService} from '../../../services/users.service';
import {collection, Firestore, onSnapshot, query, Timestamp, where} from '@angular/fire/firestore';
import {UnitsService} from '../../../services/units.service';
import {LoadingController, ToastController} from '@ionic/angular';

@Component({
	selector: 'app-edit-unit-reservation',
	templateUrl: './edit-unit-reservation.component.html',
	styleUrls: ['./edit-unit-reservation.component.scss'],
})
export class EditUnitReservationComponent implements OnInit {
	unitId: number;
	now: Date = new Date();
	endTime: string;

	startTime: string;
	selectedUser: UserDocument;
	users: UserDocument[];

	reservation: Reservation;

	loading: HTMLIonLoadingElement;

	private futureReservations: Reservation[];
	private reservationId: string;

	constructor(private readonly route: ActivatedRoute, private readonly reservationsService: ReservationsService,
	            private readonly usersService: UsersService, private readonly firestore: Firestore,
	            private readonly unitsService: UnitsService, private readonly router: Router,
	            private readonly loadingController: LoadingController, private readonly toastController: ToastController) {
	}

	ngOnInit() {
		this.init();
	}

	async init() {
		this.loading = await this.presentLoading();
		this.unitId = parseInt(this.route.snapshot.paramMap.get('unitId'), 10);
		this.reservationId = this.route.snapshot.paramMap.get('reservationId');
		await this.getReservationById();
		await this.getUnit();
		await this.getFutureReservationsByUnitId$();
		this.getUsers();
		this.dismissLoading(this.loading);
	}

	getFutureReservationsByUnitId$() {
		const q = query(
			collection(this.firestore, 'reservations'),
			where('unitId', '==', this.unitId),
			where('endTime', '>', new Date())
		);

		onSnapshot(q, (querySnapshot) => {
			const reservations: Reservation[] = [];
			console.log('querySnapshot: ', querySnapshot);
			querySnapshot.forEach(async (d) => {
				const reservation = d.data() as Reservation;
				reservation.id = d.id;
				reservations.push(reservation);
			});

			this.futureReservations = reservations;
			console.log('futureReservations: ', this.futureReservations);
		});
	}

	getUsers() {
		const q = query(
			collection(this.firestore, 'users'),
			where('verified', '==', true)
		);

		onSnapshot(q, (querySnapshot) => {
			const users: UserDocument[] = [];

			querySnapshot.forEach(async (d) => {
				const u = d.data() as UserDocument;

				users.push(u);
			});

			this.users = users;
			console.log('users: ', this.users);
		});
	}

	getReservationById() {
		this.reservationsService.getReservationById$(this.reservationId).subscribe(async (reservation) => {
			 await this.usersService.getUserDataByUserId$(reservation.userId).subscribe((user) => {
				 this.selectedUser = user;
			 });
			this.startTime = reservation.startTime.toDate().toISOString();
			this.endTime = reservation.endTime.toDate().toISOString();
			this.reservation = reservation;
		});
	}

	async getUnit() {
		const unitObs = await this.unitsService.getUnitById(this.unitId).toPromise();
		return await unitObs.toPromise();

	}

	async edit() {
		if (!this.changed()) {
			await this.presentToast('Nothing changed');
			return;
		}

		if (!this.valid()) {
			await this.presentToast('Please fill all fields correctly');
			return;
		}

		if (this.isAlreadyReserved()) {
			await this.presentToast('This unit is already reserved at this time');
			return;
		}

		const unit = await this.getUnit();

		console.log(this.selectedUser, this.startTime, this.endTime);
		const reservation = new Reservation(
			this.unitId,
			unit.name,
			this.selectedUser.id,
			Timestamp.fromDate(new Date(this.startTime)),
			Timestamp.fromDate(new Date(this.endTime))
		);

		await this.reservationsService.updateReservation$(reservation).catch(e => console.error('error updating reservation', e));

		await this.presentToast('Reservation edited successfully');
		this.router.navigate(['/units/' + this.unitId + '/reservations']).then(() => {
			console.log('navigated');
		});
	}

	validStartTime() {
		return this.startTime && this.startTime > this.now.toISOString() && this.startTime < this.endTime;
	}

	isAlreadyReserved() {
		for (const reservation of this.futureReservations) {
			if ((reservation.startTime.toDate().getTime() <= new Date(this.startTime).getTime() &&
					reservation.endTime.toDate().getTime() >= new Date(this.endTime).getTime()) ||
				(reservation.startTime.toDate().getTime() >= new Date(this.startTime).getTime() &&
					reservation.startTime.toDate().getTime() <= new Date(this.endTime).getTime()) ||
				(reservation.endTime.toDate().getTime() >= new Date(this.startTime).getTime() &&
					reservation.endTime.toDate().getTime() <= new Date(this.endTime).getTime()) ||
				(reservation.startTime.toDate().getTime() <= new Date(this.startTime).getTime() &&
					reservation.endTime.toDate().getTime() >= new Date(this.endTime).getTime())) {
				console.log('already reserved', reservation);
				return true;
			}
		}

		console.log('not reserved');
		return false;
	}

	validEndTime() {
		return this.endTime && this.endTime > this.startTime && this.endTime > this.now.toISOString();
	}

	changed() {
		return this.startTime !== this.reservation.startTime.toDate().toISOString() ||
			this.endTime !== this.reservation.endTime.toDate().toISOString() ||
			this.selectedUser.id !== this.reservation.userId;
	}

	valid() {
		return this.selectedUser.id && this.validStartTime() && this.validEndTime();
	}

	isOldOrActiveReservation() {
		return this.reservation.startTime.toDate().getTime() < this.now.getTime();
	}

	async presentToast(message: string) {
		const toast = await this.toastController.create({
			message,
			duration: 2000
		});
		await toast.present();
	}

	async presentLoading(message?: string): Promise<HTMLIonLoadingElement> {
		const loading = await this.loadingController.create({
			message: message ? message : 'Loading...',
		});
		await loading.present();
		return loading;
	}

	async dismissLoading(loading: HTMLIonLoadingElement) {
		if (loading) {
			await loading.dismiss();
		}
	}
}
