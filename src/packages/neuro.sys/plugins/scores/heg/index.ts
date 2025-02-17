const score = {
    label: 'HEG Score'
}

export function load() {

    return {
        score,
        features: { hegRatio: true },
        get: ({ hegRatio }) => Math.min(1, Math.max(0, hegRatio))
    }
}