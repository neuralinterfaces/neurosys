import { Feature } from "../../../core/plugins"

export default new Feature({
    id: 'heg', // Feature ID for consumers
    devices: [ 'HEG' ],
    duration: 1,
    calculate({ data }) {

        const averages =  Object.entries(data).reduce((acc, [ch, chData]) => {
            const average = chData.reduce((acc, val) => acc + val, 0) / chData.length
            acc[ch] = average
            return acc
        }, {}) as Record<string, number>

        return averages
    }
})