
// Devices
import syntheticDevicesPlugin from './src/packages/neuro.sys/plugins/devices/synthetic/index'
import museDevicePlugin from './src/packages/neuro.sys/plugins/devices/muse/index'
import hegDevicePlugin from './src/packages/neuro.sys/plugins/devices/heg/index'

import mockDevicesPlugin from './src/packages/neuro.sys/plugins/devices/mocks/index'

// Features
import bandsPlugin from './src/packages/neuro.sys/plugins/features/bands/index'
import hegRatioPlugin from './src/packages/neuro.sys/plugins/features/hegratio/index'

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
        // win: { requestedExecutionLevel: 'requireAdministrator' }
    },

    // services: {
    //     brainflow: "./src/services/brainflow.py",
    // },

    plugins: {


        menu: menuPlugin,
        protocols: protocolsPlugin,
        
        // ------------------- Acquisition -------------------
        mockDevices: mockDevicesPlugin,

        // Synthetic Data Streams
        syntheticDevices: syntheticDevicesPlugin,

        // BLE
        bluetooth: bluetoothPlugin, // For Desktop Support
        serial: serialPlugin, // For Desktop Support
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
        

        // ------------------- Features -------------------
        bands: bandsPlugin,
        hegRatio: hegRatioPlugin,

        // ------------------- Feedback -------------------
        textFeedback: textFeedbackPlugin,
        cursorFeedback: cursorFeedbackPlugin,
        brightnessFeedback: brightnessFeedbackPlugin,
        inspectFeedback: inspectFeedbackPlugin,


        // // Experimental Plugins
        // spotifyFeedback: spotifyFeedbackPlugin
        // robotFeedback: robotPlugin,

        // ------------------- Scores -------------------
        alphaScore: alphaScorePlugin,
        hegScore: hegScorePlugin,

        // ------------------- Example Plugins from Documentation -------------------
        ...examplePlugins,


    }
}

if (OVERLAY) config.plugins.systemOverlay = systemOverlayPlugin

export default config