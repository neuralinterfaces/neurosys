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
                default: 0.1
            },
            maxVolume: {
                title: "Maximum Volume",
                type: "number",
                max: 1,
                default: 0.75,
            }
        },
        required: [ "minVolume", "maxVolume" ]
    },
    start: () => console.log('Volume plugin started'),
    stop: () => console.log('Volume plugin stopped'),
    async set({ score }) {
        const { minVolume = 0, maxVolume = 1 } = this.settings
        const level = minVolume + (maxVolume - minVolume) * score // Normalize in level
        return setVolume(level)
    }
});

const server = createService({ volume });

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
