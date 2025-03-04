import { devices, features, evaluations, outputs, system } from 'neurosys/features'
import { registerDevicePlugins, registerFeaturePlugins, registerOutputPlugins, registerEvaluationPlugins } from 'neurosys/commoners'

import * as customPlugins from "./app/plugins"

// Examples
import examplePlugins from './app/examples/plugins/index'

const examples = {
    ...examplePlugins,
    features: {},
    devices: {},
    outputs: {},
    evaluations: {}
}

// const DEBUG = false
const DEBUG = true

const config = {
    name: "Neurosys",
    target: "electron",
    icon: "./app/assets/icon.png",

    // electron: {
    //     protocol: { scheme: 'neurosys', privileges: { secure: true, standard: true, supportFetchAPI: true } }
    // },

    services: {
        // exampleSSPs: './app/examples/examples-in-service.ts',  // Example SSPs
        volume: "./app/services/volume/main.ts" // Volume Control SSP
    },

    plugins: {

        // // --------------------------------- Required Plugins --------------------------------- //
        overlay: system.overlay({ debug: DEBUG }),
        menu: system.menu({ icon: "./app/assets/iconTemplate.png", icon2x: "./app/assets/iconTemplate@2x.png" }), // Control the application through a system tray
        
        // Allow for managing and saving the active protocol
        settings: system.settings({
            // evaluations: { heg: { enabled: true } },
            evaluations: { alpha: { enabled: true } },
            outputs: { 
                inspect: { enabled: true },
                // 'volume:volume': { settings: { range: [ 0.3, 0.9 ] } }
            },
        }),
        
        bluetooth: system.bluetooth, // For Desktop Support
        serial: system.serial, // For Desktop Support
        

        // --------------------------------- Optional Plugins --------------------------------- //
        ...registerDevicePlugins({
            ...examples.devices,        // Example Devices
            ...devices                  // SDK Devices
        }),
            
        ...registerFeaturePlugins({
            ...examples.features,       // Example Features
            ...features                 // SDK Features
        }),

        ...registerOutputPlugins({
            ...examples.outputs,        // Example Outputs
            ...outputs,                 // SDK Outputs
            ...customPlugins.outputs    // Custom Outputs
        }),

        ...registerEvaluationPlugins({
            ...examples.evaluations,         // Example Evaluations
            ...evaluations                   // SDK Evaluations
        }),
    }
}

export default config