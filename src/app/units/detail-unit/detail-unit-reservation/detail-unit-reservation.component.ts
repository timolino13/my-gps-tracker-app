import {Component, OnDestroy, OnInit} from '@angular/core';
import {Reservation} from '../../../models/reservation';
import {ActivatedRoute} from '@angular/router';
import {ReservationsService} from '../../../reservations/reservations.service';
import {UnitsService} from '../../units.service';
import {LoadingController} from '@ionic/angular';
import {timer} from 'rxjs';
import {UsersService} from '../../../services/users.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
	selector: 'app-detail-unit-reservation',
	templateUrl: './detail-unit-reservation.component.html',
	styleUrls: ['./detail-unit-reservation.component.scss'],
})
export class DetailUnitReservationComponent implements OnInit, OnDestroy {

	reservation: Reservation;
	isReservationOld: boolean;

	loading: HTMLIonLoadingElement;

	reservationSubscription: any;
	deviceTimerSubscription: any;
	unitId: string;
	reservationBuild: FormGroup;
	private reservationId: string;

	constructor(private readonly route: ActivatedRoute, private readonly reservationsService: ReservationsService,
	            private readonly unitsService: UnitsService, private readonly loadingController: LoadingController,
	            private readonly usersService: UsersService, private readonly formBuilder: FormBuilder) {

	}

	ngOnInit() {
		this.init();
	}

	async init() {
		this.reservationBuild = this.formBuilder.group({
			user: ['', [Validators.required]],
			endTime: ['', [Validators.required, Validators.minLength(6)]],
			startTime: ['', [Validators.required, Validators.minLength(6)]],
		});

		this.loading = await this.presentLoading('Loading reservation...');
		this.reservationId = this.route.snapshot.paramMap.get('reservationId');
		this.unitId = this.route.snapshot.paramMap.get('unitId');
		this.unsubscribe();

		this.reservationsService.getReservationById$(this.reservationId).subscribe(async reservation => {
			console.log(reservation);
			reservation.user = await this.usersService.getUserDataByUserId(reservation.userId);
			this.reservation = reservation;
			await this.dismissLoading(this.loading);
		});
	}

	ngOnDestroy() {
		this.unsubscribe();
	}

	unsubscribe() {
		if (this.reservationSubscription) {
			this.reservationSubscription.unsubscribe();
		}
		if (this.deviceTimerSubscription) {
			this.deviceTimerSubscription.unsubscribe();
		}
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
