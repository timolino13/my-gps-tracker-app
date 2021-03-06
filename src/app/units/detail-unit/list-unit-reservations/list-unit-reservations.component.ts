import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Reservation} from '../../../models/reservation';
import {ReservationsService} from '../../../services/reservations.service';
import {Unit} from '../../../models/unit';
import {collection, Firestore, onSnapshot, query, where} from '@angular/fire/firestore';
import {AuthService} from '../../../services/auth.service';
import {LoadingController, ViewWillEnter} from '@ionic/angular';
import {UsersService} from '../../../services/users.service';
import {timer} from 'rxjs';

@Component({
	selector: 'app-list-unit-reservations',
	templateUrl: './list-unit-reservations.component.html',
	styleUrls: ['./list-unit-reservations.component.scss'],
})
export class ListUnitReservationsComponent implements OnInit, ViewWillEnter {

	unitId: number;
	unit: Unit;
	futureReservations: Reservation[];
	unfilteredReservations: Reservation[];

	loading: HTMLIonLoadingElement;

	searchTerm: any;
	changedOrder = false;

	constructor(private readonly route: ActivatedRoute, private readonly reservationService: ReservationsService,
	            private readonly authService: AuthService, private readonly firestore: Firestore,
	            private readonly loadingController: LoadingController, private readonly usersService: UsersService,) {
	}

	ngOnInit() {
		this.unitId = parseInt(this.route.snapshot.paramMap.get('unitId'), 10);
		console.log('unitId: ', this.unitId);
	}

	ionViewWillEnter() {
		this.init();
	}

	search() {
		if (this.searchTerm) {
			this.futureReservations = this.unfilteredReservations
				.filter(reservation => reservation.user.email.toLowerCase().includes(this.searchTerm.toLowerCase()));
		} else {
			this.futureReservations = this.unfilteredReservations;
		}
	}

	async doRefresh($event: any) {
		await this.init();
		$event.target.complete();
	}

	reverse() {
		this.changedOrder = !this.changedOrder;
		this.futureReservations.reverse();
	}

	private async init() {
		this.loading = await this.presentLoading('Loading reservations...');
		await this.getFutureReservationsByUnitId();
		await this.dismissLoading(this.loading);
	}

	private async getFutureReservationsByUnitId() {
		this.futureReservations = await this.reservationService.getFutureReservationsByUnitId(this.unitId);

		for (const reservation of this.futureReservations) {
			reservation.user = await this.usersService.getUserDataByUserId(reservation.userId);
		}

		this.futureReservations.sort(this.compare);

		this.unfilteredReservations = this.futureReservations;
	}

	private compare(a: Reservation, b: Reservation) {
		if (a.user?.email < b.user?.email) {
			return -1;
		}
		if (a.user?.email > b.user?.email) {
			return 1;
		}
		return 0;
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
