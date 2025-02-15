export * as synthetic from './synthetic/eeg'
export * as muse from './muse'

export const openbci =  {
    name: 'OpenBCI',
    category: 'EEG',
    protocols: {
        usb: { label: 'USB', enabled: false },
    }
}
export const mendi = {
    name: 'Mendi',
    category: 'fNIRS',
    protocols: {
        ble: { label: 'Bluetooth', enabled: false },
    }
}

export const hegduino = {
    name: 'HEGduino',
    category: 'fNIRS',
    protocols: {
        usb: { label: 'USB', enabled: false },
        ble: { label: 'Bluetooth', enabled: false },
    }
}