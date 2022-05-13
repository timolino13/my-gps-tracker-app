import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {UnitsPageRoutingModule} from './units-routing.module';

import {UnitsPage} from './units.page';
import {DetailUnitPage} from './detail-unit/detail-unit.page';
import {IonicSelectableModule} from 'ionic-selectable';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		UnitsPageRoutingModule,
		IonicSelectableModule
	],
  declarations: [UnitsPage, DetailUnitPage]
})
export class UnitsPageModule {}
