import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../authentication/auth.service';
import {Auth} from '@angular/fire/auth';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {Unit} from '../models/unit';
import {FirebaseDevice} from '../models/firebase-device';
import {collection, collectionData, doc, Firestore} from '@angular/fire/firestore';
import {Device} from '../models/device';

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
							map(units => units as Unit[])
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
					return await this.http.get(
						`${environment.backend.url}/units/${id}`,
						{headers: {authorization: `Bearer ${await user.getIdToken()}`}}
					).pipe(
						map(unit => unit as Unit)
					).toPromise();
				}
			})
		);
	}

	getAllDevices$() {
		const devicesReference = collection(this.firestore, `devices`);
		return collectionData(devicesReference, {idField: 'imei'}) as Observable<FirebaseDevice[]>;
	}

	updateDevice(unitId: number, oldDevice: Device, newDevice: FirebaseDevice) {
		const deviceRef = doc(this.firestore, `devices/${oldDevice.imei}`);
	}

	assignDevice(unitId: number, newDevice: FirebaseDevice) {

	}
}
