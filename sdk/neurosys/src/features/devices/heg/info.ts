import { Device } from "../../../core/plugins"
import { HEGClient } from "./client"

export const name = 'HEGduino'
export const category = 'fNIRS'
export const protocols = {
    ble: { label: 'Bluetooth', enabled: true },
    serial: { label: 'USB', enabled: true },
}

// const montage = [ 'red', 'ir' ]

export default new Device({
    name: "HEGduino",
    type: "fNIRS",
    protocols: {
        ble: { label: 'Bluetooth' },
        serial: { label: 'USB' }
    },

    async disconnect() {
        if (!this.__client) return
        await this.__client?.disconnect()
        this.__client = null
    },

    async connect({ protocol }, notify) {
        const client = new HEGClient()
        await client.connect({ protocol });
        await client.start();
        client.subscribe(({ red, ir, time }) => {
            notify({ data: { red: [ red ], ir: [ ir ] }, timestamps: [ time ] }) // Same time for all updates
        })

        this.__client = client

        return { sfreq: client.sfreq }
    }
})