import { enableBluetooth, enableSerial } from "./devices/types"

import { deviceOptions, onDeviceDisconnect, onShowDevices, registerDevices, toggleDeviceConnection } from "./devices/utils"
import { loadSettings } from "./settings"

import * as outputs from './outputs'
import * as score from './score'
import * as features from './features'
// import * as devices from './devices/'

import { getAllServerSidePlugins } from "./services"
import { getPluginType } from "./plugins"
import { resolvePlugins } from "./commoners"

export {

    // Grouped Methods
    outputs,
    score,
    features,

    // Utilities
    getAllServerSidePlugins,
    loadSettings
}

// export * from './devices'
export * from './plugins'
export * from './settings'

let client: null | any = null

export const getClient = () => client
const reset = () => client = null

export const registerPlugins = async (plugins: any) => {
  const { menu: { registerOutput, registerScore } } = await resolvePlugins() // Get registration functions

  for (const key in plugins) {
    const plugin = plugins[key]
    const type = getPluginType(key, plugin)
    if (type === 'output') await outputs.registerPlugin(key, plugin, registerOutput)
    else if (type === 'feature') features.registerPlugin(key, plugin)
    else if (type === 'devices') registerDevices(plugin)
    else if (type === 'score') await score.registerPlugin(key, plugin, registerScore)
    else if (type) console.warn(`Plugin ${key} not registered because of type ${type}`)
  }

}

// ------------ Default Device Handling Behaviors ------------

onDeviceDisconnect(async () => {
  await client?.disconnect()
  reset()
  toggleDeviceConnection(true)
  client = null
})


type deviceRequestHandler = (devices: any) => any // Device
let deviceRequestHandler: null | Function = null
export const setDeviceRequestHandler = async (callback) => deviceRequestHandler = callback

// Allow Device Type Selection with a User Action (to bypass security restrictions)
onShowDevices(async () => {

  if (!deviceRequestHandler) return console.error('No device request handler set')
    
  const { device, protocol } = await deviceRequestHandler(deviceOptions)
  const { connect } = device

  reset()
  const states = { data: {}, timestamps: [] }
  client = await connect({ ...states, protocol })
  Object.assign(client, states)
  toggleDeviceConnection(false) // Success
})

enableBluetooth()
enableSerial()