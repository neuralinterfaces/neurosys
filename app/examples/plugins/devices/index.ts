import { Device, Devices } from "neurosys/plugins";

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
            clearInterval(this.__interval)
        },
        connect( { protocol }, notify ) {

            const montage = [ 'Fp1', 'Fp2' ]
            const sfreq = 512

            // Genereate data every 1/sfreq seconds
            const interval = setInterval(() => {
                const data = montage.reduce((acc, ch) => ({ ...acc, [ch]: [ Math.random() * 100 ] }), {})
                notify({ data, timestamps: [ performance.now() ] })
            }, 1000 / sfreq)

            this.__interval = interval  // Set the interval reference in the device context

            return { sfreq }
        }
    }),

    new Device({
        name: 'Random Multi-Stream Data',
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