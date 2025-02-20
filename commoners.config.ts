// import { registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins, registerScorePlugins } from 'neurosys/config'
import { registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins, registerScorePlugins } from './sdk/neurosys/src/core/commoners/config'

// Devices

import syntheticDevicesPlugin from './sdk/neurosys/src/plugins/devices/synthetic/index'
import museDevicePlugin from './sdk/neurosys/src/plugins/devices/muse/index'
import hegDevicePlugin from './sdk/neurosys/src/plugins/devices/heg/index'

import mockDevicesPlugin from './sdk/neurosys/src/plugins/devices/mocks/index'

// Features
import bandsPlugin from './sdk/neurosys/src/plugins/features/bands/index'
import hegRatioPlugin from './sdk/neurosys/src/plugins/features/heg/index'

// Output
import * as robotOutputPlugin from './sdk/neurosys/src/plugins/outputs/robot/index'
import * as textOutputPlugin from './sdk/neurosys/src/plugins/outputs/text/index'
import * as brightnessOutputPlugin from './sdk/neurosys/src/plugins/outputs/brightness/index'
import * as cursorOutputPlugin from './sdk/neurosys/src/plugins/outputs/cursor/index'
import inspectOutputPlugin from './sdk/neurosys/src/plugins/outputs/inspect/index'
import volumeOutputPlugin from './sdk/neurosys/src/plugins/outputs/volume/index'

// Scores
import * as alphaScorePlugin from './sdk/neurosys/src/plugins/scores/alpha/index'
import * as hegScorePlugin from './sdk/neurosys/src/plugins/scores/heg/index'

// Examples
import examplePlugins from './sdk/neurosys/src/plugins/examples/index'

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
        volume: "./sdk/neurosys/src/services/volume/index.ts"
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
            brightness: brightnessOutputPlugin,
            volume: volumeOutputPlugin,
            cursor: cursorOutputPlugin,
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