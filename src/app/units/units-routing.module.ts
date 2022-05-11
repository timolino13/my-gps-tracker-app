import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {UnitsPage} from './units.page';

const routes: Routes = [
	{
		path: '',
		component: UnitsPage
	},
	{
		path: ':unitId',
		loadChildren: () => import('./detail-unit/detail-unit.module').then( m => m.DetailUnitPageModule)
	}

];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class UnitsPageRoutingModule {
}
