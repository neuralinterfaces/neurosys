import { Device } from "../../../core/src/plugins"

export const openbci =  new Device({
    name: 'OpenBCI',
    type: 'EEG',
    protocols: {
        usb: { label: 'USB' },
    }
})

export const mendi = new Device({
    name: 'Mendi',
    type: 'fNIRS',
    protocols: {
        ble: { label: 'Bluetooth' },
    }
})