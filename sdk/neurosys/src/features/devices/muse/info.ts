
import { MuseClient, EEG_FREQUENCY, channelNames } from 'muse-js'
import { Device } from '../../../core/plugins'


export default new Device({
    name: 'Muse',
    type: 'EEG',
    protocols: {
        ble: { label: 'Bluetooth' },
    },

    async disconnect() {
        if (!this.__client) return
        await this.__client.disconnect()
    },

    async connect({ protocol }, notify) {

        const { DESKTOP, READY } = commoners

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
            notify({ data: { [channelNames[electrode]]: samples }, timestamps: [ performance.now() ] })
        });

        this.__client = client

        return { sfreq: EEG_FREQUENCY }
    }
})