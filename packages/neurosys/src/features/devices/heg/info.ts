import { Device } from "../../../core/plugins"
import { HEGClient } from "./client"

// const montage = [ 'red', 'ir' ]

export default new Device({
    name: "HEGduino",
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
            notify({ data: { red: [ red ], ir: [ ir ] }, timestamps: [ time ] }, 'heg') // Same time for all updates
        })

        this.__client = client

        return { heg : { sfreq: client.sfreq } }
    }
})