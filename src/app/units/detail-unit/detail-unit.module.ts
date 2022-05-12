import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {DetailUnitPageRoutingModule} from './detail-unit-routing.module';
import {ListUnitReservationsComponent} from './list-unit-reservations/list-unit-reservations.component';
import {DetailUnitReservationComponent} from './detail-unit-reservation/detail-unit-reservation.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
		DetailUnitPageRoutingModule
	],
	declarations: [ListUnitReservationsComponent, DetailUnitReservationComponent],
})
export class DetailUnitPageModule {
}
