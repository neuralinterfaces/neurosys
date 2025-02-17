import { HEGClient } from "./client"

export const name = 'HEGduino'
export const category = 'fNIRS'
export const protocols = {
    ble: { label: 'Bluetooth', enabled: true },
    serial: { label: 'USB', enabled: true },
}

export const connect = async ({ data, protocol }) => {

    const client = new HEGClient()
    await client.connect({ protocol });      
    await client.start();

    let microsecondTimestamps = []
    client.subscribe(({ red, ir, ratio, time }) => {
        // console.log("Data", red / ir, ratio)
        microsecondTimestamps.push(time)
    })


    setInterval(() => {

        // Estimate sampling frequency by calculating the difference between each timestamp and the next
        const timestamps = microsecondTimestamps
        const diffs = []
        for (let i = 1; i < timestamps.length; i++) {
            const diff = timestamps[i] - timestamps[i - 1]
            diffs.push(diff)
        }
        const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length
        const sfreq = 1 / (avgDiff / 1e6)
        console.log(sfreq, avgDiff)


    }, 1000)

    return {
        disconnect: () => client.disconnect(),  
        sfreq: client.sfreq
    }

}