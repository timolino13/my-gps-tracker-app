import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {DetailUnitPageRoutingModule} from './detail-unit-routing.module';
import {ListUnitReservationsComponent} from './list-unit-reservations/list-unit-reservations.component';
import {CreateUnitReservationComponent} from './create-unit-reservation/create-unit-reservation.component';
import {EditUnitReservationComponent} from './edit-unit-reservation/edit-unit-reservation.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
		DetailUnitPageRoutingModule
	],
	declarations: [ListUnitReservationsComponent, EditUnitReservationComponent, CreateUnitReservationComponent],
})
export class DetailUnitPageModule {
}
