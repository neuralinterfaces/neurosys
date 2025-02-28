import { Score } from "../../../core/plugins"

export default new Score({
    label: 'HEG Score',
    features: { heg: true },
    get: ({ heg }) => heg['red'] / heg['ir']
})