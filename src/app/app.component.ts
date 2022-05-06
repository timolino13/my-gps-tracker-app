import {Component} from '@angular/core';
import {AuthService} from "./authentication/auth.service";
import {Router, RouterEvent} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public pages = [
    {title: 'Reservations', url: '/reservations', icon: ''},
    {title: 'Units', url: '/units', icon: ''},
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
