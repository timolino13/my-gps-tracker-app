import {DeviceInterface} from './deviceInterface';

export interface UnitInterface {
    id: number;
    name: string;
    username: string;
    devices: DeviceInterface[];
}
