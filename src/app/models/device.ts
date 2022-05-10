export class Device {
	imei: string;
	id: number;
	assigned?: boolean;
	ownerId?: number;
	deviceTypeId?: number;
	deviceMapperId?: number;


	constructor(imei: string, id: number, assigned: boolean, deviceTypeId: number, deviceMapperId: number) {
		this.imei = imei;
		this.id = id;
		this.assigned = assigned;
		this.deviceTypeId = deviceTypeId;
		this.deviceMapperId = deviceMapperId;
	}
}
