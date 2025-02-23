import { enableBluetooth, enableSerial } from "./devices/types"

import { getAllDevices, onDeviceDisconnect, onShowDevices, toggleDeviceConnection } from "./devices/utils"
import { loadSettings } from "./settings"

import * as outputs from './outputs'
import * as score from './score'
import * as features from './features'
// import * as devices from './devices/'

import { getServicePlugins, sendToServicePlugin } from "./services"
import { getNamespace, getOriginalKey, PluginType } from "./plugins"

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
  score: ['get'],
  feature: ['calculate'],
  // device: ['connect', 'disconnect']
}

const getRegisterFunction = (type: PluginType) => {
  if (type === 'output') return outputs.registerPlugin
  if (type === 'score') return score.registerPlugin
  if (type === 'feature') return features.registerPlugin
  if (type === 'device') return null
  return null
}

const preFetchMethods = {
  output: {
    set: async (...args: any[]) => {
      const { score } = args[0]
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

const getAllServicePlugins = (services) => {

  return Object.values(services).map(baseUrl=> {

    return getServicePlugins(baseUrl).then(plugins => {

      plugins.forEach(async plugin => {
        const { plugin: identifier, type, info } = plugin

        const allowedMethods = methodsForType[type]
        if (!allowedMethods) return

        const pluginCollection = await getCollection(type)
        if (!pluginCollection) return

        const url = getServiceUrl(baseUrl, identifier)

        const methods = Object.keys(info).filter(method => allowedMethods.includes(method))

        const overrides = methods.reduce((acc, method) => {
          acc[method] = async function (...args) {
            const preFetch = preFetchMethods[type]?.[method]
            if (preFetch) {
              const result = await preFetch(...args)
              if (result == null) return
              args = Array.isArray(result) ? result : [ result ]
            }
            return sendToServicePlugin.call(this, url, method, ...args)
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

      return plugins
    })
  })
}

const loadStart = performance.now()
const promises = [
    outputs.getPlugins(),
    score.getPlugins(),
    Promise.allSettled(getAllServicePlugins(urlsByService))
]




// Load settings in Electron after all related plugins have been registered
export const readyToOutputFeedback = Promise.all(promises).then(async () => loadSettings())

readyToOutputFeedback.then(() => {
  console.log(`All plugins loaded in ${performance.now() - loadStart}ms`)
})


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