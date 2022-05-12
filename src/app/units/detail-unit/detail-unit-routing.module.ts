import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailUnitPage } from './detail-unit.page';
import {ListUnitReservationsComponent} from './list-unit-reservations/list-unit-reservations.component';
import {DetailUnitReservationComponent} from './detail-unit-reservation/detail-unit-reservation.component';
import {CreateUnitReservationComponent} from './create-unit-reservation/create-unit-reservation.component';


const routes: Routes = [
  {
    path: '',
    component: DetailUnitPage
  },
  {
    path: 'reservations',
    component: ListUnitReservationsComponent
  },
  {
    path: 'reservations/new',
    component: CreateUnitReservationComponent
  },
  {
    path: 'reservations/:reservationId',
    component: DetailUnitReservationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailUnitPageRoutingModule {}
