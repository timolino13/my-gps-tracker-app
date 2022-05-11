import {Device} from './device';
import {TrackPoint} from './track-point';

export class Unit {
	id: number;
	name: string;
	username: string;
	devices: Device[];
	deviceActivity: string;
	calculatedSpeed: number;
	trackPoint: TrackPoint;

	constructor(id: number, name: string, username: string, devices: Device[], deviceActivity: string, calculatedSpeed: number,
	            trackPoint: TrackPoint) {
		this.id = id;
		this.name = name;
		this.username = username;
		this.devices = devices;
		this.deviceActivity = deviceActivity;
		this.calculatedSpeed = calculatedSpeed;
		this.trackPoint = trackPoint;
	}
}
