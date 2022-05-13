import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {DetailUnitPage} from './detail-unit.page';
import {ListUnitReservationsComponent} from './list-unit-reservations/list-unit-reservations.component';
import {CreateUnitReservationComponent} from './create-unit-reservation/create-unit-reservation.component';
import {EditUnitReservationComponent} from './edit-unit-reservation/edit-unit-reservation.component';


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
    component: EditUnitReservationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailUnitPageRoutingModule {}
