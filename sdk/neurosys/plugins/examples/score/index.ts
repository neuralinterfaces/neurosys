import { Score } from "../../../core/src/plugins"

export default {
    load: () => {

        const { PROD } = commoners
        if (PROD) return

        return new Score({
            label: 'Average Voltage',
            features: { window: 1 }, // Use a 1 second window to calculate the average
            get({ window }) {
                
                const averagePerChannel = Object.entries(window).reduce((acc, [ch, chData]) => ({ ...acc, [ch]: chData.reduce((acc, val) => acc + val, 0) / chData.length }), {})
                return Object.values(averagePerChannel).reduce((acc, val) => acc + val, 0) / Object.values(averagePerChannel).length
            }
        })
    }
}