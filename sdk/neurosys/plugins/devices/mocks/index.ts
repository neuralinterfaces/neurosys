import { Devices } from '../../../core/src/plugins';
import * as mockDevices from './devices';

export default {
    load() {
        return new Devices(Object.values(mockDevices))
    }
}