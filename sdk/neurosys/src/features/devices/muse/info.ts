
import { MuseClient, channelNames, ppgChannelNames, EEG_FREQUENCY, EEG_SAMPLES_PER_READING, PPG_FREQUENCY, PPG_SAMPLES_PER_READING, TelemetryData, AccelerometerData } from 'muse-js'
const ACCELEROMETER_CHANNELS = ['x', 'y', 'z'];
const ACCELEROMETER_FREQUENCY = 50;
const ACCELEROMETER_SAMPLES_PER_READING = 3;

import { Device } from '../../../core/plugins'


export default new Device({
    name: 'Muse',
    protocols: {
        ble: { label: 'Bluetooth' },
    },

    async disconnect() {
        if (!this.__client) return
        await this.__client.disconnect()
    },

    async connect({ protocol }, notify) {

        const client = new MuseClient();
        client.enablePpg = true;
        client.enableAux = true;
        
        // const previousDevice = null
        // if (commoners.DESKTOP && previousDevice) {
        //     const { bluetooth } = await commoners.READY
        //     if (bluetooth) bluetooth.match(previousDevice, 5000) // Set device to match on desktop
        // }

        // options.device = previousDevice

        await client.connect();      
        await client.start();

        const expectedEEGChannels = channelNames.length - ( client.enableAux ? 0 : 1 );


        const collectedEEGData: Record<number, Record<string, number[]>> = {}
        const collectedPPGData: Record<number, Record<string, number[]>> = {}
        client.eegReadings.subscribe((data) => {
            const { electrode, samples, timestamp, index } = data;
            const collected = collectedEEGData[index] || (collectedEEGData[index] = {})
            collected[channelNames[electrode]] = samples
            if (Object.keys(collected).length === expectedEEGChannels) notify({ data: collected, timestamps: Array(EEG_SAMPLES_PER_READING).fill(timestamp) }, 'eeg')
        });

        if (client.enablePpg) {
            client.ppgReadings.subscribe((info) => {
                const { samples, timestamp, ppgChannel, index } = info;
                const collected = (collectedPPGData[index] || (collectedPPGData[index] = {}))
                collected[ppgChannelNames[ppgChannel]] = samples
                if (Object.keys(collected).length === ppgChannelNames.length) notify({ data: collected, timestamps: Array(PPG_SAMPLES_PER_READING).fill(timestamp) }, 'ppg')
            });
        }

        client.telemetryData.subscribe((telemetry: TelemetryData) => {
            const { sequenceId, ...rest } = telemetry;
            const data = Object.entries(rest).reduce((acc, [ key, value ]) => ({ ...acc, [key]: [ value ] }), {});
            notify({ 
                data, 
                timestamps: [ performance.now() ] 
            }, 'telemetry')
        });

        client.accelerometerData.subscribe((info: AccelerometerData) => {
            const samples = info.samples;
            const snippet = ACCELEROMETER_CHANNELS.reduce((acc, key, i) => ({ ...acc, [key]: samples.map(sample => sample[key]) }), {});
            notify({ data :snippet, timestamps: Array(ACCELEROMETER_SAMPLES_PER_READING).fill(performance.now()) }, 'accelerometer')
        });


        this.__client = client

        return { 
            eeg: { sfreq: EEG_FREQUENCY },
            ppg: { sfreq: PPG_FREQUENCY },
            accelerometer: { sfreq: ACCELEROMETER_FREQUENCY },
            telemetry: { sfreq: null } // Unknown
        }
    }
})