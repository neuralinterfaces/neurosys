import { Client } from "./client"
import { resolvePlugins } from "./commoners"
import { DeviceInformation, Devices, Feature, getOriginalKey, getPluginType } from "./plugins"

// Plugin Management
import * as outputs from './outputs'
import * as evaluation from './evaluation'
import * as features from './features'
import { Protocol, ProtocolSettings } from "./protocol"

// Utilities
import { calculate as evaluate } from './evaluation'
import { Score } from "./score"

const defaulKey = Symbol('default')

type ProtocolIdentifier = string | symbol

export class System {

  client: null | Client = null

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

  connect = async (
    device: any,
    protocol: string,
  ) => {
    
    if (this.client) return console.error('Client already connected')
    this.client = new Client(device)
    const result = await this.client.connect(protocol)
    this.onDeviceConnected()
    return result
  }
  
  reset = async () => {

    if (this.client) {
      await this.client.disconnect()
      this.onDeviceDisconnected()
    }

    this.client = null
  }

  
  register = async (plugins: any) => {

    const { menu: { registerOutput, registerEvaluation } } = await resolvePlugins() // Get registration functions
  
    for (const key in plugins) {
      const plugin = plugins[key]

      const type = getPluginType(key, plugin)

      if (!type) continue // Ignore plugins without a type
        
      const collection = this.plugins[type]
      if (!collection){
          console.error(`Plugin ${key} not registered because of missing collection`)
          continue
      }
      
      if (collection[key]) {
         console.error(`Plugin ${key} already registered`)
          continue
      }

      // Register an output plugin
      if (type === 'output') {
        const collection = this.plugins.output
        const { label, enabled } = collection[key] = outputs.registerPlugin(plugin)
        registerOutput(key, { label, enabled })
      }

      // Register a feature plugin
      else if (type === 'feature') {
        const collection = this.plugins.feature
          const { id = getOriginalKey(key) } = plugin
          collection[id] = plugin
      }

      else if (type === 'devices') {
        const devicePlugin = plugin as Devices
        const collection = this.plugins.devices
        const { devices } = devicePlugin
        collection.push(...devices)
      }

      // Register an evaluation plugin
      else if (type === 'evaluation') {
        const collection = this.plugins.evaluation
        const { label, enabled } = collection[key] = evaluation.registerPlugin(plugin)
        registerEvaluation(key, { label, enabled })
      }

      else if (type) console.warn(`Plugin ${key} not registered because of type ${type}`)
    }
  }

  #score = new Score() // The score normalizer

  get = (key: ProtocolIdentifier = defaulKey) => this.#protocols[key]
  load = async (settings: ProtocolSettings, id: ProtocolIdentifier = defaulKey) => this.#protocols[id] = new Protocol(settings)

  calculate = async (id: ProtocolIdentifier = defaulKey) => {

    if (!this.#protocols[id]) return null
    if (!this.client) return null // No client connected

    const plugin = await evaluation.getActivePlugin(this.plugins.evaluation)
    if (!plugin) return null // No evaluation plugin active

    const featureSettings = plugin.features || {}
      
    // Use evaluation plugin to define the features to calculate
    const calculatedFeatures: Record<string, any> = {}
    for (const id in featureSettings) {
        const plugin = this.plugins.feature[id]
        const settings = featureSettings[id]
        calculatedFeatures[id] = await features.calculate(plugin, settings, this.client)
    }

    // Calculate a score from the provided features
    const evaluatedMetric = await evaluate(plugin, calculatedFeatures)
    const normalizedScore = this.#score.update(evaluatedMetric)

    // Set the feedback from the calculated score and features
    outputs.set(this.#score, calculatedFeatures, this.plugins.output)

    return { score: normalizedScore, features: calculatedFeatures }
  }


  onDeviceConnected = async () => {}
  onDeviceDisconnected = async () => {}

}