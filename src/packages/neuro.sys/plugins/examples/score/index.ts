export default {
    load: () => {

        const { PROD } = commoners
        if (PROD) return

        return {
            label: 'Average Voltage',
            features: { window: 1 }, // Use a 1 second window to calculate the average
            get({ window }) {
                
                const averagePerChannel = Object.entries(window).reduce((acc, [ch, chData]) => ({ ...acc, [ch]: chData.reduce((acc, val) => acc + val, 0) / chData.length }), {})

                const average = Object.values(averagePerChannel).reduce((acc, val) => acc + val, 0) / Object.values(averagePerChannel).length

                // Normalize the voltage by storing historical min and max values
                this.min = this.min ? Math.min(this.min, average) : average
                this.max = this.max ? Math.max(this.max, average) : average
                return Math.max(0, Math.min(1, (average - this.min) / (this.max - this.min)))
            }
        }
    }
}