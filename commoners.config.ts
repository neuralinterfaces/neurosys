// import { devices, features, scores, outputs, system } from 'neurosys/features'
// import { registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins } from 'neurosys/plugins'

import { devices, features, scores, outputs, system } from './sdk/neurosys/src/features'
import { registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins, registerScorePlugins } from './sdk/neurosys/src/core/commoners'

// Examples
import examplePlugins from './app/examples/plugins/index'

// const OVERLAY = true
const OVERLAY = false

// const INCLUDE_EXAMPLES = true
const INCLUDE_EXAMPLES = false

const exampleFeatures = INCLUDE_EXAMPLES ? examplePlugins.features : {}
const exampleDevices = INCLUDE_EXAMPLES ? examplePlugins.devices : {}
const exampleOutputs = INCLUDE_EXAMPLES ? examplePlugins.outputs : {}
const exampleScores = INCLUDE_EXAMPLES ? examplePlugins.scores : {}

const TRANSPARENT_WINDOW_SETTINGS = {
    frame: false,
    transparent: true,
    focusable: false,
    hasShadow: false,
    thickFrame: false, // Windows
    roundedCorners: false // MacOS
}

const resolvedOutputPlugin = registerOutputPlugins({
    ...exampleOutputs,
    ...outputs
})

const config = {
    name: "Neurosys",
    target: "electron",

    icon: "./app/assets/icon.png",

    pages: {

    },

    electron: {
        protocol: { scheme: 'neurosys', privileges: { secure: true, standard: true, supportFetchAPI: true } },
        window: OVERLAY ? TRANSPARENT_WINDOW_SETTINGS : {},
    },

    services: {

        // Example SSPs
        example: './app/examples/example-ssp.ts',
        examples: './app/examples/comprehensive-ssps.ts', 

        // brainflow: "./app/services/brainflow.py",
        volume: "./app/services/volume/main.ts"
    },

    plugins: {


        // --------------------------------- Required Plugins --------------------------------- //
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

        ...resolvedOutputPlugin,

        // ...registerOutputPlugins({
        //     ...exampleOutputs,
        //     ...outputs,
        // }),

        ...registerScorePlugins({
            ...exampleScores,
            ...scores
        }),
    }
}

if (OVERLAY) config.plugins.overlay = system.overlay

 
export default config