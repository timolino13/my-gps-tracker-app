import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AuthService} from '../authentication/auth.service';
import {UsersService} from '../services/users.service';
import {map, mergeMap} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {
	constructor(private usersService: UsersService, private router: Router, private authService: AuthService) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		return this.authService.getCurrentUser$().pipe(
			mergeMap(user => {
				if (user) {
					return this.usersService.getUserDataByUserId$(user.uid).pipe(
						map(userDoc => {
							if (userDoc.roles.admin) {
								console.log('AdminGuard: User is admin');
								return true;
							} else {
								console.log('AdminGuard: User is not admin');
								this.router.navigate(['/']);
								return false;
							}
						})
					);
				} else {
					console.log('AdminGuard: User is not logged in');
					this.router.navigate(['/']);
					return of(false);
				}
			})
		);
	}

	canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		return this.canActivate(childRoute, state);
	}
}
