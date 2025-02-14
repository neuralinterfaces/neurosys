const score = {
    label: 'Alpha Score'
}

export function load() {

    return {
        score,
        features: {
            bands: [ 'alpha' ]
        },
        get({ bands }) {
            const averageAlphaRatio = Object.values(bands).reduce((acc, { alpha }) => acc + alpha, 0) / Object.keys(bands).length
            return Math.min(1, Math.max(0, averageAlphaRatio))
        }
    }
}