import { Device, Devices } from "../../../../sdk/neurosys/src/core/plugins"

const collectionInfo = {
    default: {
        montage: [ 'Fp1', 'Fp2' ],
        sfreq: 512
    },
    aux: {
        montage: [ "AUX" ],
        sfreq: 10
    }
}

export default new Devices([

    new Device({
        name: 'Random Data',
        protocols: { start: "Start" },
        disconnect() {
            Object.values(this.__intervals).forEach(clearInterval)
            this.__intervals = {}
        },
        connect(
            { protocol }, 
            notify
        ) {

            // Create a reference to the client

            const intervals = Object.entries(collectionInfo).reduce((acc, [key, { sfreq, montage }]) => {
                acc[key] = setInterval(() => {
                    const data = montage.reduce((acc, ch) => ({ ...acc, [ch]: [ Math.random() * 100 ] }), {})
                    notify({ data, timestamps: [ performance.now() ] }, key)
                }, 1000 / sfreq)
                return acc
            }, {})

            this.__intervals = intervals

            return collectionInfo

        }
    })

])