import { enableBluetooth, enableSerial } from "./devices/types"

import { getAllDevices, onDeviceDisconnect, onShowDevices, toggleDeviceConnection } from "./devices/utils"
import { loadSettings } from "./settings"

import * as outputs from './outputs'
import * as score from './score'

export {
    outputs,
    score
}

// export * from './devices'
export * from './plugins'
export * as features from './features'
export * from './settings'

let client: null | any = null

export const getClient = () => client
const reset = () => client = null

const promises = [
    outputs.getPlugins(),
    score.getPlugins()
]

// Load settings in Electron after all related plugins have been registered
export const readyToOutputFeedback = Promise.all(promises).then(async () => loadSettings())

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

  const devices = await getAllDevices()

  const { device, protocol } = await deviceRequestHandler(devices)
  const { connect } = device

  reset()
  const states = { data: {}, timestamps: [] }
  client = await connect({ ...states, protocol })
  Object.assign(client, states)
  toggleDeviceConnection(false) // Success
})

enableBluetooth()
enableSerial()