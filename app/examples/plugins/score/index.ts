import { Score } from "neurosys/plugins"

export default new Score({
    label: 'Average Voltage',
    features: { window: true },
    get({ window: windowedData }) {
        const averagePerChannel = Object.entries(windowedData).reduce((acc, [ch, chData]) => ({ ...acc, [ch]: chData.reduce((acc, val) => acc + val, 0) / chData.length }), {})
        return Object.values(averagePerChannel).reduce((acc, val) => acc + val, 0) / Object.values(averagePerChannel).length
    }
})