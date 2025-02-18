import { registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins, registerScorePlugins } from './packages/neurosys/core/src/commoners'

// Devices
import syntheticDevicesPlugin from './packages/neurosys/plugins/devices/synthetic/index'
import museDevicePlugin from './packages/neurosys/plugins/devices/muse/index'
import hegDevicePlugin from './packages/neurosys/plugins/devices/heg/index'

import mockDevicesPlugin from './packages/neurosys/plugins/devices/mocks/index'

// Features
import bandsPlugin from './packages/neurosys/plugins/features/bands/index'
import hegRatioPlugin from './packages/neurosys/plugins/features/heg/index'

// Output
import * as robotOutputPlugin from './packages/neurosys/plugins/outputs/robot/index'
import * as textOutputPlugin from './packages/neurosys/plugins/outputs/text/index'
import * as brightnessOutputPlugin from './packages/neurosys/plugins/outputs/brightness/index'
import * as cursorOutputPlugin from './packages/neurosys/plugins/outputs/cursor/index'
import inspectOutputPlugin from './packages/neurosys/plugins/outputs/inspect/index'
import volumeOutputPlugin from './packages/neurosys/plugins/outputs/volume/index'

// Scores
import * as alphaScorePlugin from './packages/neurosys/plugins/scores/alpha/index'
import * as hegScorePlugin from './packages/neurosys/plugins/scores/heg/index'

// Examples
import examplePlugins from './packages/neurosys/plugins/examples/index'

// Other Plugins
import * as systemOverlayPlugin from './packages/neurosys/plugins/other/systemOverlay/index'
import * as menuPlugin from './packages/neurosys/plugins/other/menu/index'
import * as bluetoothPlugin from './packages/neurosys/plugins/other/devices/ble/index'
import * as serialPlugin from './packages/neurosys/plugins/other/devices/serial/index'
import protocolsPlugin from './packages/neurosys/plugins/other/protocols/index'


const OVERLAY = true
// const OVERLAY = false

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

    icon: "./src/assets/icon.png",

    pages: {

    },

    electron: {
        protocol: { scheme: 'neurosys', privileges: { secure: true, standard: true, supportFetchAPI: true } },
        window: OVERLAY ? TRANSPARENT_WINDOW_SETTINGS : {},
    },

    services: {
        // brainflow: "./src/services/brainflow.py",
        volume: "./packages/neurosys/services/volume/index.ts"
    },

    plugins: {


        // --------------------------------- Required Plugins --------------------------------- //
        menu: menuPlugin, // Control the application through a system tray
        settings: protocolsPlugin, // Allow for managing and saving the active protocol
        bluetooth: bluetoothPlugin, // For Desktop Support
        serial: serialPlugin, // For Desktop Support


        // --------------------------------- Optional Plugins --------------------------------- //
        ...registerDevicePlugins({
            
            ...exampleDevices,

            mock: mockDevicesPlugin,

            // Synthetic Data Streams
            synthetic: syntheticDevicesPlugin,

            // BLE
            muse: museDevicePlugin,
            heg: hegDevicePlugin,

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

            bands: bandsPlugin,
            hegRatio: hegRatioPlugin,
        }),

        ...registerOutputPlugins({
            ...exampleOutputs,

            text: textOutputPlugin,
            cursor: cursorOutputPlugin,
            brightness: brightnessOutputPlugin,
            volume: volumeOutputPlugin,
            inspect: inspectOutputPlugin,
            
            // // Experimental Plugins
            // robot: robotPlugin,

        }),

        ...registerScorePlugins({
            ...exampleScores,
            alphaScore: alphaScorePlugin,
            hegScore: hegScorePlugin,
        }),
    }
}

if (OVERLAY) config.plugins.systemOverlay = systemOverlayPlugin

 
export default config