export function load() {

    return {
        label: 'HEG Score',
        features: { heg: true },
        get: ({ heg }) => Math.min(1, Math.max(0, heg))
    }
}