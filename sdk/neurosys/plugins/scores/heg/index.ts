export function load() {

    return {
        label: 'HEG Score',
        features: { heg: true },
        get: ({ heg }) => heg
    }
}