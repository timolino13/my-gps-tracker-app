import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailUnitPage } from './detail-unit.page';
import {ListUnitReservationsComponent} from './list-unit-reservations/list-unit-reservations.component';

const routes: Routes = [
  {
    path: '',
    component: DetailUnitPage
  },
  {
    path: 'reservations',
    component: ListUnitReservationsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailUnitPageRoutingModule {}
