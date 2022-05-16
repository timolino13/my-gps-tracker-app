import {Component, OnInit} from '@angular/core';
import {AuthService} from './services/auth.service';
import {Router, RouterEvent} from '@angular/router';
import {UsersService} from './services/users.service';
import {UserDocument} from './models/user-document';


@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss'],
})
export class AppComponent {
	public pages = [
		{title: 'Reservations', url: '/reservations', icon: '', needAdmin: false},
		{title: 'Units', url: '/units', icon: '', needAdmin: true},
	];

	selectedPath = '';

	constructor(private router: Router, private authService: AuthService) {
		router.events.subscribe((val: RouterEvent) => {
			this.selectedPath = val.url;
		});
	}

	async logout() {
		await this.authService.logout();
		await this.router.navigateByUrl('/login');
	}
}
