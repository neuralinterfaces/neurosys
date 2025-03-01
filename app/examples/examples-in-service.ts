import { Output, Feature, Devices, Device, Evaluate } from 'neurosys/plugins';
import { createService } from 'neurosys/services';

import examplePlugins from './plugins/index'

const host = process.env.HOST || "localhost";
const port = process.env.PORT

const CLASSES = {
    outputs: Output,
    features: Feature,
    evaluations: Evaluate,
    devices: Devices
}

const examples = Object.entries(examplePlugins).reduce((acc, [ type, plugins ]) => {
    return { ...acc, [type]: Object.entries(plugins).reduce((acc, [ key, plugin ]) => {
        if (plugin.desktop) return acc
        const cls = CLASSES[type]
        return ({ ...acc, [key]: plugin instanceof Devices ? new Devices(plugin.devices.map(device => new Device({...device, name: `${device.name} (SSP)`}))) : new cls({ ...plugin, label: `${plugin.label} (SSP)` }) })
    }, {}) }
}, {})

const server = createService({
    ...examples.devices,
    ...examples.features,
    ...examples.outputs,
    ...examples.evaluations,
});

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
