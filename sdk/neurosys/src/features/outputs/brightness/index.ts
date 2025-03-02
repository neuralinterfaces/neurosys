import { Output } from "../../../core/plugins/output"

export default new Output({
    label: 'Brightness',
    settings: {
        properties: {
            range: {
                type: "array",
                items: { type: "number" },
                minItems: 2,
                maxItems: 2,
                default: [0.3, 1]
            }
        },
        required: ["range"]
    },
    stop () {
        document.body.style.backgroundColor = "" // Reset
    },
    set ({ score }) {
        const { range } = this.settings
        const [ min = 0, max = 1 ] = range
        const normalized = min + ((max - min) * score)
        document.body.style.backgroundColor = `rgba(0, 0, 0, ${ (1 - normalized)})`
    }
})