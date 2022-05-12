import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReservationsService} from '../reservations.service';
import {UnitsService} from '../../units/units.service';
import {Reservation} from '../../models/reservation';
import {ActivatedRoute} from '@angular/router';
import {LoadingController} from '@ionic/angular';
import {interval, timer} from 'rxjs';

@Component({
	selector: 'app-detail-reservation',
	templateUrl: './detail-reservation.component.html',
	styleUrls: ['./detail-reservation.component.scss'],
})
export class DetailReservationComponent implements OnInit, OnDestroy {
	reservation: Reservation;
	showTracker = false;
	reservationActive = false;

	loading: HTMLIonLoadingElement;

	reservationSubscription: any;
	deviceTimerSubscription: any;

	constructor(private readonly route: ActivatedRoute, private readonly reservationsService: ReservationsService,
	            private readonly unitsService: UnitsService, private readonly loadingController: LoadingController) {
	}

	ngOnInit() {
		this.init();
	}

	async init() {
		this.loading = await this.presentLoading('Loading reservation...');
		const reservationId = this.route.snapshot.paramMap.get('reservationId');
		this.unsubscribe();

		this.reservationsService.getReservationById$(reservationId).subscribe(async reservation => {
			this.reservation = reservation;
			await this.dismissLoading(this.loading);

			this.deviceTimerSubscription = timer(0, 20000).subscribe(() => {
				this.unitsService.getUnitById(reservation.unitId).subscribe(async unitProm => {
					unitProm.toPromise().then(async unit => {
						this.reservation.unit = unit;
						const startDate = reservation.startTime.toDate();
						const endDate = reservation.endTime.toDate();
						this.reservationActive = startDate.getTime() < new Date().getTime() && endDate.getTime() > new Date().getTime();

						const activityDate = new Date(this.reservation.unit.deviceActivity);
						this.showTracker = activityDate.getTime() > startDate.getTime() && activityDate.getTime() < endDate.getTime();

						console.log('reservation', reservation);
					});
				});
			});
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
