import { DeviceInformation, Devices, Feature, getOriginalKey, getPluginType, Plugin } from "./plugins"

// Plugin Management
import * as outputs from './outputs'
import * as evaluation from './evaluation'
import { Protocol, ProtocolSettings } from "./protocol"

const defaulKey = Symbol('default')

type ProtocolIdentifier = string | symbol

export class System {

  #protocols: Record<ProtocolIdentifier, Protocol> = {}

  plugins: {
    output: Record<string, any>,
    feature: Record<string, Feature> ,
    devices: DeviceInformation[],
    evaluation: Record<string, evaluation.EvaluationInfo>
  } = {
    output: {},
    feature: {},
    devices: [],
    evaluation: {}
  }
  
  reset = async () => {
    for (const protocol of Object.values(this.#protocols)) protocol.reset() // Reset all protocols
  }
  
  register = (
    plugins: Record<string, Plugin>
  ) => {

    const registered = Object.entries(plugins).reduce((acc, [key, plugin]) => {
      
      const type = getPluginType(key, plugin)

      if (!type) return acc // Ignore plugins without a type

      key = getOriginalKey(key) // Normalize the key
        
      const collection = this.plugins[type]
      if (!collection) {
        console.error(`Plugin ${key} not registered because of missing collection`)
        return acc
      }
      
      if (collection[key]) {
        console.error(`Plugin ${key} already registered`)
        return acc
      }

      const accCollection = acc[type] ?? (acc[type] = type === 'devices' ? [] : {})
      
      // Register an output plugin
      if (type === 'output') accCollection[key] = this.plugins.output[key] = outputs.registerPlugin(plugin)

      // Register a feature plugin
      else if (type === 'feature') {
          // const { id = getOriginalKey(key) } = plugin
          const { id = key } = plugin
          accCollection[id] = this.plugins.feature[id] = plugin
      }

      else if (type === 'devices') {
        const devicePlugin = plugin as Devices
        const { devices } = devicePlugin
        this.plugins.devices.push(...devices)
        accCollection.push(...devices)
      }

      // Register an evaluation plugin
      else if (type === 'evaluation') accCollection[key] = this.plugins.evaluation[key] = evaluation.registerPlugin(plugin)

      else if (type) console.warn(`Plugin ${key} not registered because of type ${type}`)

      return acc
      
    }, {})

    return registered

  }

  get = (key: ProtocolIdentifier = defaulKey) => this.#protocols[key]

  #getAllProtocolIds = () => [ ...Object.getOwnPropertySymbols(this.#protocols), ...Object.keys(this.#protocols) ]
  getAll = () => this.#getAllProtocolIds().map(id => this.#protocols[id])

  load = async (settings: ProtocolSettings, id: ProtocolIdentifier = defaulKey) =>this.#protocols[id] = new Protocol(settings, this)

  async calculate(client: any) {

    const result: Record<string | symbol, any> = {}

    for (const id of this.#getAllProtocolIds()) {
      const protocol = this.#protocols[id]
      const output = await protocol.calculate(client)
      if (output) result[id] = output
    }

    return result
  }

}