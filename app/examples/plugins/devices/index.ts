import { Device, Devices } from "../../../../sdk/neurosys/src/core/plugins"

export default new Devices([

    new Device({
        name: 'Random Data',
        protocols: { start: "Start" },
        connect: ({ data }) => {

            const sfreq = 512
            const channels = [ 'Fp1', 'Fp2' ]
            const interval = setInterval(() => {

                channels.forEach((ch) => {
                    const arr = data[ch] || (data[ch] = [])
                    arr.push(Math.random() * 100)
                })

            }, 1000 / sfreq)

            return {
                disconnect: () => clearInterval(interval),
                sfreq,
            }

        }
    })

])