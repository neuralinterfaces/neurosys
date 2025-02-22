import { enableBluetooth, enableSerial } from "./devices/types"

import { getAllDevices, onDeviceDisconnect, onShowDevices, toggleDeviceConnection } from "./devices/utils"
import { loadSettings } from "./settings"

import * as outputs from './outputs'
import * as score from './score'
import * as features from './features'
// import * as devices from './devices/'

import { getServicePlugins, sendToServicePlugin } from "./services"
import { getNamespace, getOriginalKey } from "./plugins"

export {
    outputs,
    score,
    features
}

// export * from './devices'
export * from './plugins'
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

const getServiceUrl = (url, encoded) => {
  const key = getOriginalKey(encoded)
  const namespace = getNamespace(encoded)

  if (namespace) return new URL(`${namespace}/${key}`, url)
  return new URL(key, url)
}

const methodsForType = {
  output: ['start', 'set', 'stop'],
  score: ['calculate'],
  feature: ['calculate'],
  // device: ['connect', 'disconnect']
}

const getRegisterFunction = (type) => {
  if (type === 'output') return outputs.registerPlugin
  // if (type === 'score') return score.registerPlugin
  return null
}

const preFetchMethods = {
  output: {
    set: async (...args: any[]) => {
      const score = args[0]
      if (isNaN(score)) return null // Don't send null to services | NOTE: Should this apply across the board?
      return args
    }
  }
}

const getCollection = (type) => {
  if (type === 'output') return outputs.getPlugins()
  if (type === 'score') return score.getPlugins()
  if (type == 'feature') return features.getAllFeatures()
  if (type === 'device') return getAllDevices()
  return null
}

Object.values(urlsByService).forEach(baseUrl=> {
  getServicePlugins(baseUrl).then(plugins => {
    console.warn('Registering Service Plugins:', baseUrl, plugins)
    plugins.forEach(async plugin => {
      const { plugin: identifier, type, info } = plugin

      const methods = methodsForType[type]
      if (!methods) return

      const pluginCollection = await getCollection(type)
      if (!pluginCollection) return

      const url = getServiceUrl(baseUrl, identifier)

      const overrides = methods.reduce((acc, method) => {
        acc[method] = async (...args) => {
          const preFetch = preFetchMethods[type]?.[method]
          if (preFetch) {
            const result = await preFetch(...args)
            if (result == null) return
            args = Array.isArray(result) ? result : [ result ]
          }
          return sendToServicePlugin(url, method, ...args)
        }
        return acc
      }, {})

      const register = getRegisterFunction(type)
      if (!register) return

      register(
        identifier, 
        { ...info, ...overrides }, 
        pluginCollection
      )

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