import { Evaluate } from "../../../core/plugins"

export default new Evaluate({
    label: 'HEG Score',
    features: { heg: true },
    get: ({ heg }) => heg['red'] / heg['ir']
})