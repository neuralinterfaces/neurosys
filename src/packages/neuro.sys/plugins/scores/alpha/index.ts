// ----------- Bands -------------
//     delta: [1, 3],
//     theta: [4, 7],
//     alpha: [8, 12],
//     beta: [13, 30],
//     gamma: [31, 50]

export function load() {

    return {
        label: 'Alpha Score',
        features: {
            bands: { 
                bands: { alpha: [ 8, 12 ] },
                 windowDuration: 1 
            }
        },
        get({ bands = {} }) {
            const averageAlphaRatio = Object.values(bands).reduce((acc, { alpha }) => acc + alpha, 0) / Object.keys(bands).length
            return Math.min(1, Math.max(0, averageAlphaRatio))
        }
    }
}