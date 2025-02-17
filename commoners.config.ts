import { registerDevicePlugins, registerFeaturePlugins, registerFeedbackPlugins, registerScorePlugins } from './src/packages/neuro.sys/core/src/commoners'

// Devices
import syntheticDevicesPlugin from './src/packages/neuro.sys/plugins/devices/synthetic/index'
import museDevicePlugin from './src/packages/neuro.sys/plugins/devices/muse/index'
import hegDevicePlugin from './src/packages/neuro.sys/plugins/devices/heg/index'

import mockDevicesPlugin from './src/packages/neuro.sys/plugins/devices/mocks/index'

// Features
import bandsPlugin from './src/packages/neuro.sys/plugins/features/bands/index'
import hegRatioPlugin from './src/packages/neuro.sys/plugins/features/heg/index'

// Feedback
import * as robotFeedbackPlugin from './src/packages/neuro.sys/plugins/feedback/robot/index'
import * as textFeedbackPlugin from './src/packages/neuro.sys/plugins/feedback/text/index'
import * as brightnessFeedbackPlugin from './src/packages/neuro.sys/plugins/feedback/brightness/index'
import * as cursorFeedbackPlugin from './src/packages/neuro.sys/plugins/feedback/cursor/index'
import spotifyFeedbackPlugin from './src/packages/neuro.sys/plugins/feedback/spotify/index'
import inspectFeedbackPlugin from './src/packages/neuro.sys/plugins/feedback/inspect/index'

// Scores
import * as alphaScorePlugin from './src/packages/neuro.sys/plugins/scores/alpha/index'
import * as hegScorePlugin from './src/packages/neuro.sys/plugins/scores/heg/index'

// Examples
import examplePlugins from './src/packages/neuro.sys/plugins/examples/index'

// Other Plugins
import * as systemOverlayPlugin from './src/packages/neuro.sys/plugins/other/systemOverlay/index'
import * as menuPlugin from './src/packages/neuro.sys/plugins/other/menu/index'
import * as bluetoothPlugin from './src/packages/neuro.sys/plugins/other/devices/ble/index'
import * as serialPlugin from './src/packages/neuro.sys/plugins/other/devices/serial/index'
import protocolsPlugin from './src/packages/neuro.sys/plugins/other/protocols/index'


const OVERLAY = true
// const OVERLAY = false

// const INCLUDE_EXAMPLES = true
const INCLUDE_EXAMPLES = false


const exampleFeatures = INCLUDE_EXAMPLES ? examplePlugins.feature : {}
const exampleDevices = INCLUDE_EXAMPLES ? examplePlugins.device : {}
const exampleFeedback = INCLUDE_EXAMPLES ? examplePlugins.feedback : {}
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
        // spotify: './src/plugins/feedback/spotify/index.html',
    },

    electron: {
        protocol: { scheme: 'neurosys', privileges: { secure: true, standard: true, supportFetchAPI: true } },
        window: OVERLAY ? TRANSPARENT_WINDOW_SETTINGS : {},
    },

    // services: {
    //     brainflow: "./src/services/brainflow.py",
    // },

    plugins: {


        // --------------------------------- Required Plugins --------------------------------- //
        menu: menuPlugin, // Control the application through a system tray
        settings: protocolsPlugin, // Allow for managing and saving the active protocol
        bluetooth: bluetoothPlugin, // For Desktop Support
        serial: serialPlugin, // For Desktop Support


        // --------------------------------- Optional Plugins --------------------------------- //
        ...registerDevicePlugins({
            
            ...exampleDevices,

            mockDevices: mockDevicesPlugin,

            // Synthetic Data Streams
            syntheticDevices: syntheticDevicesPlugin,

            // BLE
            museDevice: museDevicePlugin,
            hegDevice: hegDevicePlugin,

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

        ...registerFeedbackPlugins({
            ...exampleFeedback,

            textFeedback: textFeedbackPlugin,
            cursorFeedback: cursorFeedbackPlugin,
            brightnessFeedback: brightnessFeedbackPlugin,
            inspectFeedback: inspectFeedbackPlugin,
            
            // // Experimental Plugins
            // spotifyFeedback: spotifyFeedbackPlugin
            // robotFeedback: robotPlugin,

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