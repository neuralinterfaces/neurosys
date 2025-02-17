const score = {
    label: 'Alpha Score'
}

// ----------- Bands -------------
//     delta: [1, 3],
//     theta: [4, 7],
//     alpha: [8, 12],
//     beta: [13, 30],
//     gamma: [31, 50]

export function load() {

    return {
        score,
        features: {
            bands: {
                alpha: [ 8, 12 ]
            }
        },
        get({ bands = {} }) {
            const averageAlphaRatio = Object.values(bands).reduce((acc, { alpha }) => acc + alpha, 0) / Object.keys(bands).length
            return Math.min(1, Math.max(0, averageAlphaRatio))
        }
    }
}