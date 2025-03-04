import { setVolume } from 'neurosys/services/volume';
import { createService } from 'neurosys/services';
import { Output } from 'neurosys/plugins';

const host = process.env.HOST || "localhost";
const port = process.env.PORT

const volume = new Output({
    label: "Volume",
    settings: {
        properties: {
            minVolume: {
                title: "Minimum Volume",
                type: "number",
                minimum: 0,
                maximum: 100,
                multipleOf: 1,
                default: 10
            },
            maxVolume: {
                title: "Maximum Volume",
                type: "number",
                minimum: 0,
                maximum: 100,
                multipleOf: 1,
                default: 75,
            }
        },
        required: [ "minVolume", "maxVolume" ],

        __uiSchema: {
            minVolume: { "ui:widget": "range" },
            maxVolume: { "ui:widget": "range" }
        }
    },
    start: () => console.log('Volume plugin started'),
    stop: () => console.log('Volume plugin stopped'),
    async set({ score }) {
        
        const { minVolume: _min = 0, maxVolume: _max = 100 } = this.settings
        const minVolume = _min / 100
        const maxVolume = _max / 100
        const level = minVolume + (maxVolume - minVolume) * score // Normalize in level

        console.log(level, _min, _max)

        return setVolume(level)
    }
});

const server = createService({ volume });

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
