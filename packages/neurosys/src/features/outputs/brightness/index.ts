import { Output } from "../../../core/plugins/output"

export default new Output({
    label: 'Brightness',
    settings: {

        properties: {
            minBrightness: {
                title: "Minimum Brightness",
                type: "number",
                minimum: 0,
                maximum: 100,
                multipleOf: 1,
                default: 30
            },
            maxBrightness: {
                title: "Maximum Brightness",
                type: "number",
                minimum: 0,
                maximum: 100,
                multipleOf: 1,
                default: 100
            }
        },
        
        required: [ "minBrightness", "maxBrightness" ],

        if: {
            properties: {
                minBrightness: { "type": "number" },
                maxBrightness: { "type": "number" }
            },
            required: [ "minBrightness", "maxBrightness" ]
        },
        then: {
            properties: {
                maxBrightness: {
                    type: "number",
                    minimum: { "$data": "1/minBrightness" }
                },
                minBrightness: {
                    maximum: { "$data": "1/maxBrightness" },
                    type: "number"
                }
            }
        },

        __uiSchema: {
            minBrightness: { "ui:widget": "range" },
            maxBrightness: { "ui:widget": "range" }
        }
    },
    stop () {
        document.body.style.backgroundColor = "" // Reset
    },
    set ({ score }) {
        const { minBrightness: _min = 0, maxBrightness: _max = 100 } = this.settings
        
        const maxBrightness = _max / 100
        const minBrightness = _min / 100

        const normalized = minBrightness + ((maxBrightness - minBrightness) * score)
        document.body.style.backgroundColor = `rgba(0, 0, 0, ${ (1 - normalized)})`
    }
})