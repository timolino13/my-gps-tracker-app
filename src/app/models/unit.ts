import {Device} from './device';

export class Unit {
	id: number;
	name: string;
	username: string;
	devices: Device[];

	constructor(id: number, name: string, username: string, devices: Device[]) {
		this.id = id;
		this.name = name;
		this.username = username;
		this.devices = devices;
	}
}
