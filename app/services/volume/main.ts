import { getMuted, setVolume } from '../../../sdk/neurosys/src/services/volume';
import { createService } from '../../../sdk/neurosys/src/services';
import { Output, registerOutputPlugins } from '../../../sdk/neurosys/src/core/plugins';

// import { createService } from 'neurosys/services';
// import { setVolume } from 'neurosys/services/volume';
// import { Output } from 'neurosys/plugins';


const host = process.env.HOST || "localhost";
const port = process.env.PORT

const volumeOutputPlugin = new Output({
    label: "Volume",
    start: () => console.log('Volume plugin started'),
    stop: () => console.log('Volume plugin stopped'),
    set: async (score: number) =>  setVolume(score)
});

const server = createService({
    ...registerOutputPlugins({
        volume: volumeOutputPlugin,
    })
});

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
