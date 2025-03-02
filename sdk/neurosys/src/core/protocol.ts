import { System } from "./system"

import { Client } from "./client"

// Plugin Management
import * as features from './features'

import type { EnhancedEvaluatePlugin } from "./evaluation"
import type { EnhancedOutputPlugin } from "./outputs"

// Utilities
import { calculate as evaluate } from './evaluation'
import { Score } from "./score"

type OutputSettings = Record<string, EnhancedOutputPlugin>
type EvaluationSettings = Record<string, EnhancedEvaluatePlugin>

export type CalculationOutput = { score: number, __score: Score, [key: string]: any }

export type ProtocolSettings = {
    outputs?: OutputSettings
    evaluations?: EvaluationSettings
}

export class Protocol {

    outputs: OutputSettings = {}
    evaluations: EvaluationSettings = {}

    #system: System
    #score = new Score() // The score normalizer
    

    constructor(settings: ProtocolSettings, system: System) {
        Object.assign(this, settings)
        this.#system = system
        console.log('Protocol loaded', JSON.parse(JSON.stringify(this)))
        this.reset()
    }

    reset() {
        this.#score = new Score()
    }

    update(type: keyof ProtocolSettings, plugin: string, settings = {}) {
        const collection = this[type]
        const oldValue = collection[plugin]

        Object.assign(collection[plugin] ?? (collection[plugin] = {}), settings)

        const isOnlyDisabled = typeof settings === 'object' && Object.keys(settings).length <= 1 && !settings.enabled
        if (isOnlyDisabled) delete collection[plugin]     
        
        const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(collection[plugin])

        if (type === 'evaluations' && hasChanged) this.reset() // Reset the score if the evaluation has changed

        return {
            changed: hasChanged,
            value: collection[plugin]
        }
    }

    async calculate(client: Client): Promise<CalculationOutput | null> {
        
        if (!client) return null // No client connected

        const allPlugins = this.#system.plugins

        const activeEvaluations = Object.entries(this.evaluations).filter(([ _, value ]) => value.enabled).map(([key]) => key)
        const plugins = activeEvaluations.reduce((acc, key) => [ ...acc, allPlugins.evaluation[key] ], []) // Use protocol settings to get active evaluation plugins
        
        if (!plugins.length) return null // No evaluation plugin active
        if (plugins.length > 1) console.warn('Only one evaluation plugin is supported for now')

        const plugin = plugins[0] // Only one evaluation plugin is supported for now
    
        const featureSettings = plugin.features || {}
          
        // Use evaluation plugin to define the features to calculate
        const calculatedFeatures: Record<string, any> = {}
        for (const id in featureSettings) {
            const plugin = allPlugins.feature[id]
            const settings = featureSettings[id]
            calculatedFeatures[id] = await features.calculate(plugin, settings, client)
        }
    
        // Calculate a score from the provided features
        const evaluatedMetric = await evaluate(plugin, calculatedFeatures)
        const normalizedScore = this.#score.update(evaluatedMetric)

        // Get active outputs
        const activeOutputs = Object.entries(this.outputs).filter(([ _, value ]) => value.enabled).map(([key]) => key)
        const outputs = activeOutputs.reduce((acc, key) => [ ...acc, allPlugins.output[key] ], []) // Use protocol settings to get active output plugins

        // Set the feedback from the calculated score and features
        const inputs = { score: normalizedScore, __score: this.#score, ...calculatedFeatures }

        outputs.map(async (plugin) => {

            await plugin.set(
                inputs, // Features
                plugin.__info // Context
            )

            plugin.__latest = inputs
        })

        return inputs
    }
}

  // #isSupported = (settings: ProtocolSettings) => {
  //   const { outputs, evaluations } = settings
  //   const missing = []
  //   for (const key in outputs) {
  //     const plugin = this.plugins.output[key]
  //     if (!plugin) missing.push(key)
  //   }
  //   for (const key in evaluations) {
  //     const plugin = this.plugins.evaluation[key]
  //     if (!plugin) missing.push(key)
  //   }

  //   const isSupported = !missing.length
  //   if (!isSupported) console.warn(`Missing plugins: ${missing.join(', ')}`)

  //   return isSupported
  // }
