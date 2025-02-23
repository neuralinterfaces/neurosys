// import { devices, features, scores, outputs, system } from 'neurosys/features'
// import { registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins } from 'neurosys/plugins'

import { devices, features, scores, outputs, system } from './sdk/neurosys/src/features'
import { registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins, registerScorePlugins } from './sdk/neurosys/src/core/commoners'

// Examples
// import examplePlugins from './app/examples/plugins/index'
// const exampleFeatures = examplePlugins.features
// const exampleDevices = examplePlugins.devices
// const exampleOutputs = examplePlugins.outputs
// const exampleScores = examplePlugins.scores
const exampleFeatures = {}
const exampleDevices = {}
const exampleOutputs = {}
const exampleScores = {}

// const DEBUG = false
const DEBUG = true

const config = {
    name: "Neurosys",
    target: "electron",

    icon: "./app/assets/icon.png",

    pages: {

    },

    electron: {
        protocol: { scheme: 'neurosys', privileges: { secure: true, standard: true, supportFetchAPI: true } }
    },

    services: {

        // // Example SSPs
        // example: './app/examples/example-ssp.ts',
        // examples: './app/examples/comprehensive-ssps.ts', 

        // brainflow: "./app/services/brainflow.py",
        volume: "./app/services/volume/main.ts"
    },

    plugins: {


        // --------------------------------- Required Plugins --------------------------------- //
        overlay: system.overlay({ debug: DEBUG }),
        menu: system.menu({ icon: "./app/assets/iconTemplate.png", icon2x: "./app/assets/iconTemplate@2x.png" }), // Control the application through a system tray
        settings: system.settings, // Allow for managing and saving the active protocol
        bluetooth: system.bluetooth, // For Desktop Support
        serial: system.serial, // For Desktop Support
        

        // --------------------------------- Optional Plugins --------------------------------- //
        ...registerDevicePlugins({
            
            ...exampleDevices,

            ...devices

            // brainflow {
            //     load: function () {
            //         const { SERVICES: { brainflow : { url }} } = commoners
                    
            //         return {
            //             get: async (path) => {
            //                 const endpoint = new URL(path, url)
            //                 const result = await fetch(endpoint.href)
            //                 const json = await result.json()
            //                 return json
            //             },
            //             post: async (path, body) => {
            //                 const endpoint = new URL(path, url)
            //                 const result = await fetch(endpoint.href, { method: 'POST', body: JSON.stringify(body) })
            //                 const json = await result.json()
            //                 return json
            //             }
            //         }
            //     }
            // },
        }),
            
        ...registerFeaturePlugins({
            ...exampleFeatures,
            ...features
        }),

        ...registerOutputPlugins({
            ...exampleOutputs,
            ...outputs
        }),

        ...registerScorePlugins({
            ...exampleScores,
            ...scores
        }),
    }
}

export default config