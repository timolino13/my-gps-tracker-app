import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailUnitPageRoutingModule } from './detail-unit-routing.module';

import { DetailUnitPage } from './detail-unit.page';
import {ListUnitReservationsComponent} from './list-unit-reservations/list-unit-reservations.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailUnitPageRoutingModule
  ],
  declarations: [DetailUnitPage, ListUnitReservationsComponent]
})
export class DetailUnitPageModule {}
