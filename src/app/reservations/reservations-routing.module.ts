import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ReservationsPage} from './reservations.page';
import {DetailReservationComponent} from './detail-reservation/detail-reservation.component';

const routes: Routes = [
	{
		path: '',
		component: ReservationsPage
	},
	{
		path: ':reservationId',
		component: DetailReservationComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ReservationsPageRoutingModule {
}
