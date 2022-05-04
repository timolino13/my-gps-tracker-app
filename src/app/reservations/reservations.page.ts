import { Component, OnInit } from '@angular/core';
import {AuthService} from "../authentication/auth.service";

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.page.html',
  styleUrls: ['./reservations.page.scss'],
})
export class ReservationsPage implements OnInit {

  constructor(private readonly authService: AuthService) { }

  ngOnInit() {
  }

  async logout() {
    await this.authService.logout();
  }
}
