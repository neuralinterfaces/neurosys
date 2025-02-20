import { Device } from "../../../core/src/plugins"
import { HEGClient } from "./client"

export const name = 'HEGduino'
export const category = 'fNIRS'
export const protocols = {
    ble: { label: 'Bluetooth', enabled: true },
    serial: { label: 'USB', enabled: true },
}

export default new Device({
    name: "HEGduino",
    type: "fNIRS",
    protocols: {
        ble: { label: 'Bluetooth' },
        serial: { label: 'USB' }
    },
    async connect({ data, timestamps, protocol }) {

        const client = new HEGClient()
        await client.connect({ protocol });
        await client.start();

        client.subscribe(({ red, ir, time }) => {
            const redArray = data['red'] || (data['red'] = [])
            const irArray = data['ir'] || (data['ir'] = [])
            redArray.push(red)
            irArray.push(ir)
            timestamps.push(time)
        })


        return {
            disconnect: () => client.disconnect(),
            sfreq: client.sfreq
        }
    }
})