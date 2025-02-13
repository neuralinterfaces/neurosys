import * as bluetoothPlugin from './src/plugins/ble/index'
import * as systemOverlayPlugin from './src/plugins/systemOverlay/index'
import * as menuPlugin from './src/plugins/menu/index'

// Feedback
import * as robotFeedbackPlugin from './src/plugins/feedback/robot/index'
import * as textFeedbackPlugin from './src/plugins/feedback/text/index'
import * as BrightnessFeedbackPlugin from './src/plugins/feedback/brightness/index'
import mainProcessFeedbackPlugin from './src/plugins/feedback/main-process/index'
import inspectFeedbackPlugin from './src/plugins/feedback/inspect/index'

// Scores
import  * as sineScorePlugin from './src/plugins/scores/sine/index'
import * as alphaScorePlugin from './src/plugins/scores/alpha/index'

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
    name: "neuro.sys",
    target: "electron",

    pages: {
        settings: './src/pages/settings/settings.html'
    },

    electron: {
        window: OVERLAY ? TRANSPARENT_WINDOW_SETTINGS : {},
        // win: { requestedExecutionLevel: 'requireAdministrator' }
    },

    // services: {
    //     brainflow: "./src/services/brainflow.py",
    // },

    plugins: {
        bluetooth: bluetoothPlugin,
        menu: menuPlugin,

        // Test Plugins
        mainProcess: mainProcessFeedbackPlugin,
        sineScore: sineScorePlugin,

        // Feedback
        textFeedback: textFeedbackPlugin,
        brightnessFeedback: BrightnessFeedbackPlugin,
        inspectFeedback: inspectFeedbackPlugin,
        // robotFeedback: robotPlugin,

        // Scores
        alphaScore: alphaScorePlugin,

        // // Data Acquisition
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

    }
}

if (OVERLAY) config.plugins.systemOverlay = systemOverlayPlugin

export default config