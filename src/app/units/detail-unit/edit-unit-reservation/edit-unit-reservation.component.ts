import {Component, OnInit} from '@angular/core';
import {UserDocument} from '../../../models/user-document';
import {Unit} from '../../../models/unit';
import {Reservation} from '../../../models/reservation';
import {ActivatedRoute, Router} from '@angular/router';
import {ReservationsService} from '../../../services/reservations.service';
import {UsersService} from '../../../services/users.service';
import {collection, Firestore, onSnapshot, query, Timestamp, where} from '@angular/fire/firestore';
import {UnitsService} from '../../../services/units.service';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';

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

	private unitFutureReservations: Reservation[];
	private userFutureReservations: Reservation[];
	private reservationId: string;

	constructor(private readonly route: ActivatedRoute, private readonly reservationsService: ReservationsService,
	            private readonly usersService: UsersService, private readonly firestore: Firestore,
	            private readonly unitsService: UnitsService, private readonly router: Router,
	            private readonly loadingController: LoadingController, private readonly toastController: ToastController,
	            private readonly alertController: AlertController) {
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
		this.getUsers();
		await this.dismissLoading(this.loading);
	}

	async edit() {
		this.loading = await this.presentLoading();

		if (!this.changed()) {
			await this.presentToast('Nothing changed');
			await this.dismissLoading(this.loading);
			return;
		}

		if (!this.valid()) {
			await this.presentToast('Please fill all fields correctly');
			await this.dismissLoading(this.loading);
			return;
		}

		if (await this.isUnitAlreadyReserved()) {
			await this.presentToast('This unit is already reserved at this time');
			await this.dismissLoading(this.loading);
			return;
		}

		if (await this.isUserAlreadyReserved()) {
			await this.presentToast('This user already has a reservation at this time');
			await this.dismissLoading(this.loading);
			return;
		}

		const unit = await this.getUnit();

		const reservation = new Reservation(
			this.unitId,
			unit.name,
			this.selectedUser.id,
			Timestamp.fromDate(new Date(this.startTime)),
			Timestamp.fromDate(new Date(this.endTime))
		);

		reservation.id = this.reservationId;

		this.reservationsService.updateReservation$(reservation).then(async () => {

			await this.presentToast('Reservation edited successfully');

			this.router.navigate(['/units/' + this.unitId + '/reservations']).then(() => {
				console.log('navigated');
			});
		}).catch(e => {
			console.error('error updating reservation', e);

			this.presentErrorAlert('Error editing reservation', 'There was an error while saving your changes. Please try again.');
		});

		await this.dismissLoading(this.loading);
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

	validStartTime() {
		return this.startTime && this.startTime > this.now.toISOString() && this.startTime < this.endTime;
	}

	validEndTime() {
		return this.endTime && this.endTime > this.startTime && this.endTime > this.now.toISOString();
	}

	private async getUnit() {
		const unitObs = await this.unitsService.getUnitById$(this.unitId).toPromise();
		return await unitObs.toPromise();

	}

	private getUsers() {
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

	private getReservationById() {
		this.reservationsService.getReservationById$(this.reservationId).subscribe(async (reservation) => {
			await this.usersService.getUserDataByUserId$(reservation.userId).subscribe((user) => {
				this.selectedUser = user;
			});
			this.startTime = reservation.startTime.toDate().toISOString();
			this.endTime = reservation.endTime.toDate().toISOString();
			this.reservation = reservation;
		});
	}

	private async getFutureReservationsByUnitId() {
		return await this.reservationsService.getFutureReservationsByUnitId(this.unitId);
	}

	private async getFutureReservationsByUserId() {
		return await this.reservationsService.getFutureReservationsByUserId(this.selectedUser.id);
	}

	private async isUnitAlreadyReserved() {
		if (!this.unitFutureReservations) {
			this.unitFutureReservations = await this.getFutureReservationsByUnitId();
		}

		for (const reservation of this.unitFutureReservations) {
			if (reservation.unitId !== this.unitId) {
				if (this.reservationsService.isReserved(reservation, new Date(this.startTime), new Date(this.endTime))) {
					return true;
				}
			}
		}

		return false;
	}

	private async isUserAlreadyReserved() {
		this.userFutureReservations = await this.getFutureReservationsByUserId();

		for (const reservation of this.userFutureReservations) {
			if (reservation.unitId !== this.unitId) {
				if (this.reservationsService.isReserved(reservation, new Date(this.startTime), new Date(this.endTime))) {
					console.log('user already reserved', reservation);
					return true;
				}
			}
		}
	}

	private async presentToast(message: string) {
		const toast = await this.toastController.create({
			message,
			duration: 2000
		});
		await toast.present();
	}

	private async presentLoading(message?: string): Promise<HTMLIonLoadingElement> {
		const loading = await this.loadingController.create({
			message: message ? message : 'Loading...',
		});
		await loading.present();
		return loading;
	}

	private async presentErrorAlert(header, message) {
		const alert = await this.alertController.create({
			header,
			message,
			buttons: ['OK']
		});

		await alert.present();
	}

	private async dismissLoading(loading: HTMLIonLoadingElement) {
		if (loading) {
			await loading.dismiss();
		}
	}
}
