import { Devices } from '../../../core/plugins';
import * as mockDevices from './devices';

export default {
    load() {
        return new Devices(Object.values(mockDevices))
    }
}