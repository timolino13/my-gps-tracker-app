import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../authentication/auth.service';
import {Auth} from '@angular/fire/auth';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {collection, collectionData, Firestore, queryEqual, where} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {Unit} from '../models/unit';
import {FirebaseDevice} from '../models/firebase-device';

@Injectable({
	providedIn: 'root'
})
export class UnitsService {

	constructor(private readonly auth: Auth, private readonly http: HttpClient, private readonly authService: AuthService,
	            private readonly firestore: Firestore) {
	}

	getUnits() {
		return this.authService.getCurrentUser$().pipe(
			map(async user => {
					if (user) {
						return await this.http.get(
							`${environment.backend.url}/units`,
							{headers: {authorization: `Bearer ${await user.getIdToken()}`}}
						).pipe(
							map(units => {
								console.log(units);
								return units as Unit[];
							})
						).toPromise();
					}
				}
			)
		);
	}

	getUnitById(id: number) {
		return this.authService.getCurrentUser$().pipe(
			map(async user => {
				if (user) {
					const res = await this.http.get(
						`${environment.backend.url}/units/${id}`,
						{headers: {authorization: `Bearer ${await user.getIdToken()}`}}
					).pipe(
						map(unit => {
							console.log(unit);
							return unit as Unit;
						})
					).toPromise();

					console.log(res);
					return res;
				}
			})
		);
	}

	getAllDevices$() {
		const devicesReference = collection(this.firestore, `devices`);
		return collectionData(devicesReference) as Observable<FirebaseDevice[]>;
	}

	getFreeDevices$() {
		const query = query(collection(this.firestore, `devices`), where('assigned', '==', false));
		const devicesReference = collection(this.firestore, `devices`);
		return collectionData(devicesReference) as Observable<FirebaseDevice[]>;
	}
}
