// import { Output, Feature, Devices, Score } from 'neurosys/plugins';
// import { createService } from 'neurosys/services';

import { Output, Feature, Devices, Score } from '../../sdk/neurosys/src/core/plugins';
import { createService } from '../../sdk/neurosys/src/services';


import examplePlugins from './plugins/index'

const host = process.env.HOST || "localhost";
const port = process.env.PORT

const CLASSES = {
    outputs: Output,
    features: Feature,
    scores: Score,
    devices: Devices
}

const examples = Object.entries(examplePlugins).reduce((acc, [ type, plugins ]) => {
    return { ...acc, [type]: Object.entries(plugins).reduce((acc, [ key, plugin ]) => {
        if (plugin.desktop) return acc
        const cls = CLASSES[type]
        return ({ ...acc, [key]: plugin instanceof Devices ? new Devices(plugin.devices) : new cls({ ...plugin, label: `${plugin.label} (SSP)` }) })
    }, {}) }
}, {})

const server = createService({
    ...examples.devices,
    ...examples.features,
    ...examples.outputs,
    ...examples.scores,
});

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
