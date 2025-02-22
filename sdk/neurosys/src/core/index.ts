import { enableBluetooth, enableSerial } from "./devices/types"

import { getAllDevices, onDeviceDisconnect, onShowDevices, toggleDeviceConnection } from "./devices/utils"
import { loadSettings } from "./settings"

import * as outputs from './outputs'
import * as score from './score'
import { getServicePlugins, sendToOutputPlugin } from "./services"

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


// --------------------------- Load Plugins from Services ---------------------------
const { SERVICES } = commoners

const urlsByService = Object.entries(SERVICES).reduce((acc, [key, value]) => {
  acc[key] = value.url
  return acc
}, {})


// // NOTE: This plugin requires a specific service to be configured

// import { Output } from "../../../core/plugins/output"

// export default ( serviceName: string ) => ({
//     load() {

//         if (!commoners.SERVICES[serviceName]) return

//         return new Output({
//             label: 'Volume',
//             set: async (score) => {
//                 const { url } = commoners.SERVICES[serviceName]
//                 if (isNaN(score)) return // Only send valid scores
//                 await fetch(url, { method: 'POST', body: JSON.stringify({ score }) })
//             }
//         })
//     }
// })

Object.entries(urlsByService).forEach(([ service, baseUrl ]) => {
  getServicePlugins(baseUrl).then(plugins => {
    plugins.forEach(async plugin => {
      const { plugin: name, type, info } = plugin
      const pluginUrl = new URL(name, baseUrl)
      if (type === 'output') {
        const outputPlugins = await outputs.getPlugins()
        outputs.registerPlugin(
          name, 
          {
            ...info,
            set: (score) => sendToOutputPlugin(pluginUrl, score)
          },
          outputPlugins
        )
      }
    })
  })
})

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