import { Score } from "../../../core/plugins"

export function load() {

    return new Score({
        label: 'HEG Score',
        features: { heg: true },
        get: ({ heg }) => heg
    })
}