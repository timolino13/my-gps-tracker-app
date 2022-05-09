import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {UnitsPage} from './units.page';
import {DetailUnitComponent} from './detail-unit/detail-unit.component';

const routes: Routes = [
	{
		path: '',
		component: UnitsPage
	},
	{
		path: ':unitId',
		component: DetailUnitComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class UnitsPageRoutingModule {
}
