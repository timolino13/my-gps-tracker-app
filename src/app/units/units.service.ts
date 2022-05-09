import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../authentication/auth.service';
import {Auth} from '@angular/fire/auth';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UnitsService {

    constructor(private readonly auth: Auth, private readonly http: HttpClient, private readonly authService: AuthService) {
    }

    getUnits() {
        return this.authService.getCurrentUser$().pipe(
            map(async user => {
                    if (user) {
                        const res = this.http.get(
                            `${environment.backend.url}/units`,
                            {headers: {authorization: `Bearer ${await user.getIdToken()}`}}
                        ).toPromise();

                        return await res;
                    }
                }
            )
        );
    }

    getUnitById(id: number) {
        return this.authService.getCurrentUser$().pipe(
            map(async user => {
                    if (user) {
                        const res = this.http.get(
                            `${environment.backend.url}/units/${id}`,
                            {headers: {authorization: `Bearer ${await user.getIdToken()}`}}
                        ).toPromise();

                        return await res;
                    }
                }
            )
        );
    }
}
