const score = {
    label: 'Alpha Score'
}

export function load() {

    return {
        score,
        features: {
            bands: [ 'alpha' ]
        },
        get: ({ bands }) => {
            const averageAlphaRatio = Object.values(bands).reduce((acc, { alpha }) => acc + alpha, 0) / Object.keys(bands).length
            const score = 10 * averageAlphaRatio // Lots of frequencies outside of alpha band. Blinks make this go wild...
            return Math.min(1, Math.max(0, score))
        }
    }
}