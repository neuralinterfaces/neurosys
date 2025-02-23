import { Score } from "../../../../sdk/neurosys/src/core/plugins"

export default new Score({
    label: 'Average Voltage',
    get({ window }) {
        const averagePerChannel = Object.entries(window).reduce((acc, [ch, chData]) => ({ ...acc, [ch]: chData.reduce((acc, val) => acc + val, 0) / chData.length }), {})
        return Object.values(averagePerChannel).reduce((acc, val) => acc + val, 0) / Object.values(averagePerChannel).length
    }
})