import { createService } from '../../sdk/neurosys/src/services';
import { Feature, Output, registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins, registerScorePlugins, Score } from '../../sdk/neurosys/src/core/plugins';

const host = process.env.HOST || "localhost";
const port = process.env.PORT

const output = new Output({
    label: 'Print — Service',
    start: function () {
        console.log('Starting Print Output')
    },
    stop: function () {
        console.log('Stopping Print Output')
    },
    set: function (score) {
        console.log(score)
    }
});

const feature = new Feature({
    id: 'random:service',
    calculate: function (data) {
        return Math.random()
    }
});

const score = new Score({
    label: "Random - Service",
    features: { ["random:service"]: {} },
    get: function (features) {
        const { ["random:service"]: random } = features
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
