import { Score } from "../../../core/src/plugins"

export function load() {

    return new Score({
        label: 'HEG Score',
        features: { heg: true },
        get: ({ heg }) => heg
    })
}