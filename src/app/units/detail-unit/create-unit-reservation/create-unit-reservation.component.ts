import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ReservationsService} from '../../../services/reservations.service';
import {UsersService} from '../../../services/users.service';
import {collection, doc, Firestore, onSnapshot, query, Timestamp, where} from '@angular/fire/firestore';
import {UserDocument} from '../../../models/user-document';
import {Reservation} from '../../../models/reservation';
import {UnitsService} from '../../../services/units.service';
import {Unit} from '../../../models/unit';
import {LoadingController, ToastController} from '@ionic/angular';

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

	loading: HTMLIonLoadingElement;

	private unit: Unit;
	private unitFutureReservations: Reservation[];
	private userFutureReservations: Reservation[];

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
		this.getUsers();
		await this.getUnit();
		await this.dismissLoading(this.loading);
	}

	async reserve() {
		this.loading = await this.presentLoading();
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

		console.log(this.selectedUser, this.startTime, this.endTime);
		const reservation = new Reservation(
			this.unitId,
			this.unit.name,
			this.selectedUser.id,
			Timestamp.fromDate(new Date(this.startTime)),
			Timestamp.fromDate(new Date(this.endTime))
		);

		await this.reservationsService.createReservation$(reservation);

		await this.dismissLoading(this.loading);

		await this.presentToast('Reservation created');
		this.router.navigate(['/units/' + this.unitId + '/reservations']).then(() => {
			console.log('navigated');
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
		});
	}

	async getFutureReservationsByUnitId() {
		return await this.reservationsService.getFutureReservationsByUnitId(this.unitId);
	}

	async getFutureReservationsByUserId() {
		return await this.reservationsService.getFutureReservationsByUserId(this.selectedUser.id);
	}

	validStartTime() {
		return this.startTime && this.startTime > this.now.toISOString() && this.startTime < this.endTime;
	}

	async isUnitAlreadyReserved() {
		if (!this.unitFutureReservations) {
			this.unitFutureReservations = await this.getFutureReservationsByUnitId();
		}

		for (const reservation of this.unitFutureReservations) {
			if (this.reservationsService.isReserved(reservation, new Date(this.startTime), new Date(this.endTime))) {
				return true;
			}
		}

		return false;
	}

	async isUserAlreadyReserved() {
		this.userFutureReservations = await this.getFutureReservationsByUserId();

		for (const reservation of this.userFutureReservations) {
			if (this.reservationsService.isReserved(reservation, new Date(this.startTime), new Date(this.endTime))) {
				console.log('user already reserved', reservation);
				return true;
			}
		}
	}

	validEndTime() {
		return this.endTime && this.endTime > this.startTime && this.endTime > this.now.toISOString();
	}

	valid() {
		return this.selectedUser && this.validStartTime() && this.validEndTime();
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

	private async getUnit() {
		const unitObs = await this.unitsService.getUnitById(this.unitId).toPromise();
		this.unit = await unitObs.toPromise();

		console.log('Unit: ', this.unit);
	}
}
