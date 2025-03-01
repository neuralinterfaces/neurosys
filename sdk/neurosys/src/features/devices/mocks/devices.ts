import { Device } from "../../../core/plugins"

export const openbci =  new Device({
    name: 'OpenBCI',
    protocols: {
        usb: { label: 'USB' },
    }
})

export const mendi = new Device({
    name: 'Mendi',
    protocols: {
        ble: { label: 'Bluetooth' },
    }
})