// import { registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins, registerScorePlugins } from 'neurosys/config'
// import { devices, features, scores, outputs }from 'neurosys/plugins'

import { registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins, registerScorePlugins } from './sdk/neurosys/src/core/commoners/config'
import { devices, features, scores, outputs } from './sdk/neurosys/src/plugins'

const neurosysVolumeServiceSrcPath = "./sdk/neurosys/src/services/volume/index.ts"
import packagedNeurosysVolumeService from "neurosys/services/volume?url"
// import unpackagedNeurosysVolumeService from "./sdk/neurosys/src/services/volume/index?url"

// Examples
import examplePlugins from './app/frontend/example-plugins/index'

// Other Plugins
import * as systemOverlayPlugin from './sdk/neurosys/src/plugins/other/systemOverlay/index'
import menuPlugin from './sdk/neurosys/src/plugins/other/menu/index'
import * as bluetoothPlugin from './sdk/neurosys/src/plugins/other/devices/ble/index'
import * as serialPlugin from './sdk/neurosys/src/plugins/other/devices/serial/index'
import protocolsPlugin from './sdk/neurosys/src/plugins/other/protocols/index'


// const OVERLAY = true
const OVERLAY = false

// const INCLUDE_EXAMPLES = true
const INCLUDE_EXAMPLES = false


const exampleFeatures = INCLUDE_EXAMPLES ? examplePlugins.feature : {}
const exampleDevices = INCLUDE_EXAMPLES ? examplePlugins.device : {}
const exampleOutputs = INCLUDE_EXAMPLES ? examplePlugins.outputs : {}
const exampleScores = INCLUDE_EXAMPLES ? examplePlugins.score : {}

const TRANSPARENT_WINDOW_SETTINGS = {
    frame: false,
    transparent: true,
    focusable: false,
    hasShadow: false,
    thickFrame: false, // Windows
    roundedCorners: false // MacOS
}

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
        // brainflow: "./app/services/brainflow.py",
        volume: neurosysVolumeServiceSrcPath,
        // volume: unpackagedNeurosysVolumeService,
        // volume: packagedNeurosysVolumeService
        
    },

    plugins: {


        // --------------------------------- Required Plugins --------------------------------- //
        menu: menuPlugin({ icon: "./app/assets/iconTemplate.png", icon2x: "./app/assets/iconTemplate@2x.png" }), // Control the application through a system tray
        settings: protocolsPlugin, // Allow for managing and saving the active protocol
        bluetooth: bluetoothPlugin, // For Desktop Support
        serial: serialPlugin, // For Desktop Support


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
            ...outputs,
            volume: outputs.volume('volume') // Register volume service explicitly
        }),

        ...registerScorePlugins({
            ...exampleScores,
            ...scores
        }),
    }
}

if (OVERLAY) config.plugins.systemOverlay = systemOverlayPlugin

 
export default config