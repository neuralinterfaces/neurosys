import { Output } from "../../../core/plugins/output"

export default new Output({
    label: 'Brightness',
    settings: {
        properties: {
            minBrightness: {
                title: "Minimum Brightness",
                type: "number",
                default: 0.3
            },
            maxBrightness: {
                title: "Maximum Brightness",
                type: "number",
                max: 1,
                default: 1,
            }
        },
        required: [ "minVolume", "maxVolume" ]
    },
    stop () {
        document.body.style.backgroundColor = "" // Reset
    },
    set ({ score }) {
        const { minBrightness = 0, maxBrightness = 1 } = this.settings
        const normalized = minBrightness + ((maxBrightness - minBrightness) * score)
        document.body.style.backgroundColor = `rgba(0, 0, 0, ${ (1 - normalized)})`
    }
})