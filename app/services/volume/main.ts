import { setVolume } from 'neurosys/services/volume';
import { createService } from 'neurosys/services';
import { Output } from 'neurosys/plugins';

const host = process.env.HOST || "localhost";
const port = process.env.PORT

const volume = new Output({
    label: "Volume",
    settings: {
        properties: {
            range: {
                type: "array",
                items: { type: "number" },
                minItems: 2,
                maxItems: 2,
                default: [0.1, 0.75]
            }
        },
        required: ["range"]
    },
    start: () => console.log('Volume plugin started'),
    stop: () => console.log('Volume plugin stopped'),
    async set({ score }) {
        const { range } = this.settings
        const [ min = 0, max = 1 ] = range
        const level = min + (max - min) * score // Normalize in level
        return setVolume(level)
    }
});

const server = createService({
    volumeOutput: volume
});

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
