import { Devices } from '../../../core/plugins';
import * as mockDevices from './devices';

export function load() {
    return new Devices(Object.values(mockDevices))
}
