import * as mockDevices from './devices';

export default {
    load() {
        return {
            devices: Object.values(mockDevices).map(device => {
                return {
                    ...device,
                    protocols: Object.entries(device.protocols).reduce((obj, [ protocol, value ]) => {
                        return { ...obj,  [protocol]: { ...value, enabled: false } }
                    }, {})
                }
            })
        }
    }
}