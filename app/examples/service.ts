import { createService } from '../../sdk/neurosys/src/services';
import { Feature, Output, registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins, registerScorePlugins, Score } from '../../sdk/neurosys/src/core/plugins';

const host = process.env.HOST || "localhost";
const port = process.env.PORT

const output = new Output({
    label: 'Print — Service',
    start () {
        console.log('Starting Print Output')
    },
    stop () {
        console.log('Stopping Print Output')
    },
    set (features) {
        console.log(features)
    }
});

const featureId = Math.random().toString(36).substring(7);

const feature = new Feature({
    id: featureId,
    duration: 0, // No data should be passed
    calculate: () => Math.random()
});

const score = new Score({
    label: "Random - Service",
    features: { [featureId]: {} },
    get: function (features) {
        const { [featureId]: random } = features
        return random
    }
});

const server = createService({
    ...registerOutputPlugins({ print: output }),
    ...registerScorePlugins({ random: score }),
    ...registerFeaturePlugins({ random: feature }),
    // ...registerDevicePlugins({ ...examplePlugins.devices })
});

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
