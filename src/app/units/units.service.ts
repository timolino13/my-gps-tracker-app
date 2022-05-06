import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UsersService} from "../services/users.service";
import {AuthService} from "../authentication/auth.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private token: string;

  constructor(private readonly http: HttpClient, private readonly authService: AuthService) {
    this.getToken();
  }

  getToken() {
    this.authService.getCurrentUser().getIdToken().then(r => this.token = r);
  }

  getUnits(): Promise<any> {
    return this.http.get(
      `${environment.backend.url}/units`,
      {headers: {authorization: `Bearer ${this.token}`}}
    ).toPromise();
  }

  getUnitById(id: number): Promise<any> {
    return this.http.get(
      `${environment.backend.url}/units/${id}`,
      {headers: {authorization: `Bearer ${this.token}`}}
    ).toPromise();
  }
}
