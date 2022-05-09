import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {canActivate, redirectLoggedInTo, redirectUnauthorizedTo} from "@angular/fire/auth-guard";


const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['reservations']);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./authentication/login/login.module').then(m => m.LoginPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'request-password-reset',
    loadChildren: () => import('./authentication/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'reservations',
    loadChildren: () => import('./reservations/reservations.module').then(m => m.ReservationsPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'units',
    loadChildren: () => import('./units/units.module').then( m => m.UnitsPageModule)
  },
  { // must be the last route
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
