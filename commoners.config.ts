
// Devices
import syntheticDevicesPlugin from './src/plugins/devices/synthetic/index'
import museDevicePlugin from './src/plugins/devices/muse/index'
import mockDevicesPlugin from './src/plugins/devices/mocks/index'

// Features
import bandsPlugin from './src/plugins/features/bands/index'

// Feedback
import * as robotFeedbackPlugin from './src/plugins/feedback/robot/index'
import * as textFeedbackPlugin from './src/plugins/feedback/text/index'
import * as brightnessFeedbackPlugin from './src/plugins/feedback/brightness/index'
import * as cursorFeedbackPlugin from './src/plugins/feedback/cursor/index'
import spotifyFeedbackPlugin from './src/plugins/feedback/spotify/index'
import inspectFeedbackPlugin from './src/plugins/feedback/inspect/index'

// Scores
import * as alphaScorePlugin from './src/plugins/scores/alpha/index'

// Examples
import examplePlugins from './src/plugins/examples/index'

// Other Plugins
import * as systemOverlayPlugin from './src/plugins/other/systemOverlay/index'
import * as menuPlugin from './src/plugins/other/menu/index'
import * as bluetoothPlugin from './src/plugins/other/ble/index'
import protocolsPlugin from './src/plugins/other/protocols/index'


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
        museDevicePlugin: museDevicePlugin,

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

        // ------------------- Example Plugins from Documentation -------------------
        ...examplePlugins,


    }
}

if (OVERLAY) config.plugins.systemOverlay = systemOverlayPlugin

export default config