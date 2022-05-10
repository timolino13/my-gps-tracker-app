import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../authentication/auth.service';
import {Auth} from '@angular/fire/auth';
import {map, switchMap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {Unit} from '../models/unit';
import {Device} from '../models/device';
import {collection, collectionData, doc, docData, Firestore, getDoc, updateDoc} from '@angular/fire/firestore';

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
			switchMap(async user => {
				if (user) {
					return this.http.get(
						`${environment.backend.url}/units/${id}`,
						{headers: {authorization: `Bearer ${await user.getIdToken()}`}}
					).pipe(
						switchMap(async (unit: Unit) => new Unit(unit.id, unit.name, unit.username, unit.devices))
					);
				}
			})
		);
	}

	getAllDevicesFromFirestore$() {
		const devicesReference = collection(this.firestore, `devices`);
		return collectionData(devicesReference, {idField: 'imei'}) as Observable<Device[]>;
	}

	async getDeviceByImeiFromFirestore(imei: string) {
		const deviceDocRef = doc(this.firestore, `devices/${imei}`);
		const docSnap = await getDoc(deviceDocRef);
		if (docSnap.exists) {
			return docSnap.data() as Device;
		}
		return null;
	}

	async updateDevice(unitId: number, oldDevice: Device, newDevice: Device) {
		console.log(`Updating device ${oldDevice.imei}`);
		const oldDeviceRef = doc(this.firestore, `devices/${oldDevice.imei}`);

		await updateDoc(oldDeviceRef, {
			assigned: false,
			id: 0,
			ownerId: 0
		});

		await this.assignDevice(unitId, newDevice);
	}

	async assignDevice(unitId: number, newDevice: Device) {
		const newDeviceRef = doc(this.firestore, `devices/${newDevice.imei}`);

		const token = await this.authService.getCurrentUser$().pipe(
			switchMap(async (user) => {
				console.log(user);
				if (user) {
					return user.getIdToken();
				}
			})
		).toPromise();

		const device = await this.http.post(
			`${environment.backend.url}/units/${unitId}/devices`,
			{
				imei: newDevice.imei,
				deviceTypeId: newDevice.deviceTypeId,
				deviceMapperId: newDevice.deviceMapperId,
			},
			{headers: {authorization: `Bearer ${token}`}}
		).pipe(
			switchMap(async (d) => {
				console.log(d);
				return d as Device;
			})
		).toPromise();

		console.log(`Device assigned`, device);

		await updateDoc(newDeviceRef, {
			assigned: true,
			id: device.id,
			ownerId: unitId
		});
	}
}
