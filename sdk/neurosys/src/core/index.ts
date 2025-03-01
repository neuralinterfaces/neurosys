import { enableBluetooth, enableSerial, setDeviceDiscoveryHandler } from "./devices/types"

import { deviceOptions, onDeviceDisconnect, onShowDevices, registerDevices, toggleDeviceConnection } from "./devices/utils"

// System Plugin Utilities
export { setIgnoreMouseEvents } from './interactions'
export { loadSettings } from "./settings"

// Calculation Utilities
export { Score } from "./score"
export { Protocol } from "./protocol"

// Plugin Management
import * as outputs from './outputs'
import * as evaluation from './evaluation'
import * as features from './features'
// import * as devices from './devices/'

// SSPs
export { getAllServerSidePlugins } from "./services"
import { getPluginType } from "./plugins"
import { resolvePlugins } from "./commoners"
import { System } from "./system"

export {

    // Handlers
    setDeviceDiscoveryHandler,

    // Grouped Methods
    outputs,
    evaluation,
    features,
}

// export * from './devices'
export * from './plugins'
export * from './settings'


export const neurosys = new System()

export const registerPlugins = async (plugins: any) => {
  const { menu: { registerOutput, registerEvaluation } } = await resolvePlugins() // Get registration functions

  for (const key in plugins) {
    const plugin = plugins[key]
    const type = getPluginType(key, plugin)
    if (type === 'output') await outputs.registerPlugin(key, plugin, registerOutput)
    else if (type === 'feature') features.registerPlugin(key, plugin)
    else if (type === 'devices') registerDevices(plugin)
    else if (type === 'evaluation') evaluation.registerPlugin(key, plugin, registerEvaluation)
    else if (type) console.warn(`Plugin ${key} not registered because of type ${type}`)
  }

}

// ------------ Default Device Handling Behaviors ------------

onDeviceDisconnect(async () => {
  await neurosys.reset()
  toggleDeviceConnection(true)
})


type DeviceRequestHandler = (devices: any) => any // Device
let deviceRequestHandler: null | DeviceRequestHandler = null
export const setDeviceRequestHandler = async (callback: DeviceRequestHandler) => deviceRequestHandler = callback


// Allow Device Type Selection with a User Action (to bypass security restrictions)
onShowDevices(async () => {

  if (!deviceRequestHandler) return console.error('No device request handler set')
    
  const { device, protocol } = await deviceRequestHandler(deviceOptions)
  
  neurosys.connect(device, protocol)



  toggleDeviceConnection(false) // Success
})

enableBluetooth()
enableSerial()