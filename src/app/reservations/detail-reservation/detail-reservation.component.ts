import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReservationsService} from '../../services/reservations.service';
import {UnitsService} from '../../services/units.service';
import {Reservation} from '../../models/reservation';
import {ActivatedRoute} from '@angular/router';
import {LoadingController} from '@ionic/angular';
import {interval, Subscription, timer} from 'rxjs';

@Component({
	selector: 'app-detail-reservation',
	templateUrl: './detail-reservation.component.html',
	styleUrls: ['./detail-reservation.component.scss'],
})
export class DetailReservationComponent implements OnInit, OnDestroy {
	reservation: Reservation;
	showTrackerData = false;
	reservationActive = false;

	loading: HTMLIonLoadingElement;

	private reservationSubscription: any;
	private deviceTimerSubscription: any;
	private unitSubscription: Subscription;

	constructor(private readonly route: ActivatedRoute, private readonly reservationsService: ReservationsService,
	            private readonly unitsService: UnitsService, private readonly loadingController: LoadingController) {
	}

	ngOnInit() {
		this.init();
	}

	ngOnDestroy() {
		this.unsubscribe();
	}

	private async init() {
		this.loading = await this.presentLoading('Loading reservation...');
		const reservationId = this.route.snapshot.paramMap.get('reservationId');
		this.unsubscribe();
		this.getReservationById(reservationId);
		await this.dismissLoading(this.loading);
	}

	private unsubscribe() {
		if (this.reservationSubscription) {
			this.reservationSubscription.unsubscribe();
		}
		if (this.deviceTimerSubscription) {
			this.deviceTimerSubscription.unsubscribe();
		}
		if (this.unitSubscription) {
			this.unitSubscription.unsubscribe();
		}
	}

	private getReservationById(reservationId: string) {
		this.reservationSubscription = this.reservationsService.getReservationById$(reservationId).subscribe(async reservation => {
			this.reservation = reservation;

			const startDate = reservation.startTime.toDate();
			const endDate = reservation.endTime.toDate();

			this.deviceTimerSubscription = timer(0, 20000).subscribe(() => {
				this.reservationActive = startDate.getTime() < new Date().getTime() && endDate.getTime() > new Date().getTime();

				if (this.reservationActive) {
					this.unitSubscription = this.unitsService.getUnitById$(reservation.unitId).subscribe(async unitProm => {
						unitProm.toPromise().then(async unit => {
							this.reservation.unit = unit;

							const activityDate = new Date(this.reservation.unit.deviceActivity);
							this.showTrackerData = activityDate.getTime() > startDate.getTime() && activityDate.getTime() < endDate.getTime();
						});
					});
				} else {
					this.showTrackerData = false;
				}
			});
		});
	}

	private async presentLoading(message?: string): Promise<HTMLIonLoadingElement> {
		const loading = await this.loadingController.create({
			message: message ? message : 'Loading...',
		});
		await loading.present();
		return loading;
	}

	private async dismissLoading(loading: HTMLIonLoadingElement) {
		if (loading) {
			await loading.dismiss();
		}
	}
}
