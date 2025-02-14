export * as synthetic from './synthetic/eeg'
export * as muse from './muse'

export const openbci =  {
    name: 'OpenBCI',
    category: 'EEG',
    protocols: [ { type: 'usb', enabled: false } ]
}
export const mendi = {
    name: 'Mendi',
    category: 'fNIRS',
    protocols: [ { type: 'bluetooth', enabled: false } ]
}

export const hegduino = {
    name: 'HEGduino',
    category: 'fNIRS',
    protocols: [ 
      { type: 'usb', enabled: false },
      { type: 'bluetooth', enabled: false }
    ],
}