

import { MuseClient, EEG_FREQUENCY, channelNames } from 'muse-js'

export const name = 'Muse'
export const category = 'EEG'
export const protocols = [ 'bluetooth' ]

const { DESKTOP, READY } = commoners

export const connect = async ({ data }) => {

    const client = new MuseClient();

    const previousDevice = null
    if (DESKTOP && previousDevice) {
        const { bluetooth } = await READY
        if (bluetooth) bluetooth.match(previousDevice, 5000) // Set device to match on desktop
    }

    // options.device = previousDevice

    await client.connect();      
    await client.start();

    client.eegReadings.subscribe(({ electrode, samples }) => {
        const chName = channelNames[electrode]
        const signal = data[chName] || ( data[chName] = [])
        signal.push(...samples)
    });

    return {
        sfreq: EEG_FREQUENCY
    }

}