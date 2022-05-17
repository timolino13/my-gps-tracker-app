import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Auth} from '@angular/fire/auth';
import {map, switchMap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {Unit} from '../models/unit';
import {Device} from '../models/device';
import {collection, doc, Firestore, getDoc, getDocs, query, updateDoc, where} from '@angular/fire/firestore';
import {TrackPoint} from '../models/track-point';

@Injectable({
	providedIn: 'root'
})
export class UnitsService {

	constructor(private readonly auth: Auth, private readonly http: HttpClient, private readonly authService: AuthService,
	            private readonly firestore: Firestore) {
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

	async updateDevice(unitId: number, oldDevice: Device, newDevice: Device) {
		console.log(`Updating device ${oldDevice.imei}`);
		await this.removeDevice(unitId, oldDevice);

		await this.assignDevice(unitId, newDevice);
	}

	async removeDevice(unitId: number, oldDevice: Device): Promise<boolean> {
		const token = await this.authService.getCurrentUser$().pipe(
			switchMap(async (user) => {
				console.log(user);
				if (user) {
					return user.getIdToken();
				}
			})
		).toPromise();

		const response = await this.http.delete(
			`${environment.backend.url}/units/${unitId}/devices/${oldDevice.id}`,
			{
				headers: {authorization: `Bearer ${token}`},
				observe: 'response'
			}
		).toPromise();

		console.log(`Device removed`, response);
		if (response.ok) {
			const oldDeviceRef = doc(this.firestore, `devices/${oldDevice.imei}`);

			await updateDoc(oldDeviceRef, {
				assigned: false,
				id: 0,
				ownerId: 0
			});

			return true;
		}
		return false;
	}

	getUnits() {
		return this.authService.getCurrentUser$().pipe(
			map(async user => {
					if (user) {
						return await this.http.get(
							`${environment.backend.url}/units`,
							{headers: {authorization: `Bearer ${await user.getIdToken()}`}}
						).pipe(
							map((units: Unit[]) => {
								const unitsList: Unit[] = [];
								units.forEach(unit => {
									unitsList.push(unit);
								});
								return unitsList;
							})
						).toPromise();
					}
				}
			)
		);
	}

	getUnitById$(id: number): Observable<Observable<Unit>> {
		return this.authService.getCurrentUser$().pipe(
			switchMap(async user => {
				if (user) {
					return this.http.get(
						`${environment.backend.url}/units/${id}`,
						{
							headers: {authorization: `Bearer ${await user.getIdToken()}`},
						}
					)as Observable<Unit>;
				}
			})
		);
	}

	async getFreeDevices(): Promise<Device[]> {
		const devicesRef = collection(this.firestore, 'devices');

		// Create a query against the collection.
		const q = query(devicesRef, where('assigned', '==', false));

		const querySnapshot = await getDocs(q);
		const availableDevices: Device[] = [];
		querySnapshot.forEach((d) => {
			console.log(d.data());
			availableDevices.push(d.data() as Device);
		});
		return availableDevices;
	}

	async getDeviceByImeiFromFirestore(imei: string) {
		const deviceDocRef = doc(this.firestore, `devices/${imei}`);
		const docSnap = await getDoc(deviceDocRef);
		if (docSnap.exists) {
			return docSnap.data() as Device;
		}
		return null;
	}
}
