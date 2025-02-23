import { createService, Feature, Output, registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins, registerScorePlugins, Score } from '../../sdk/neurosys/src/services';

const host = process.env.HOST || "localhost";
const port = process.env.PORT

const exampleOutput = new Output({
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

const exampleFeature = new Feature({
    id: featureId,
    duration: 0, // No data should be passed
    calculate: () => Math.random()
});

const exampleScore = new Score({
    label: "Random - Service",
    features: { [featureId]: {} },
    get: function (features) {
        const { [featureId]: random } = features
        return random
    }
});

const server = createService({
    ...registerOutputPlugins({ exampleOutput }),
    ...registerScorePlugins({ exampleScore }),
    ...registerFeaturePlugins({ exampleFeature }),
    // ...registerDevicePlugins({ ...examplePlugins.devices })
});

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
