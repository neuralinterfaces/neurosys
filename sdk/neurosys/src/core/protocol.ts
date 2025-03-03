import { System } from "./system"

import { Client } from "./client"

// Plugin Management
import * as features from './features'

import type { EnhancedEvaluatePlugin } from "./evaluation"
import type { EnhancedOutputPlugin } from "./outputs"

// Utilities
import { calculate as evaluate } from './evaluation'
import { Score } from "./score"
import { getTemplate, resolveSchema } from "./plugins/utils"

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

    settings: Record<string, Record<string, any>> = {}

    #system: System
    #score = new Score() // The score normalizer
    

    constructor(settings: ProtocolSettings, system: System) {
        Object.assign(this, settings)
        this.#system = system
        this.reset()
    }

    reset() {
        this.#score = new Score()
        this.#refreshSettings()
    }

    update(
        type: keyof ProtocolSettings, 
        plugin: string, 
        settings = {}
    ) {

        const collection = this[type]
        const oldSettings = structuredClone(collection[plugin])

        Object.assign(collection[plugin] ?? (collection[plugin] = {}), settings)

        // Delete from the collection if the plugin is only disabled
        const isOnlyDisabled = typeof collection[plugin] === 'object' && Object.keys(collection[plugin]).length <= 1 && !collection[plugin].enabled
        if (isOnlyDisabled) delete collection[plugin]     
        
        const newSettings = collection[plugin]
        const hasChanged = JSON.stringify(oldSettings) !== JSON.stringify(newSettings)

        if (type === 'evaluations' && hasChanged) this.reset() // Reset the score if the evaluation has changed
        else if (hasChanged) this.#refreshSettings() // Update the settings for the output plugins

        return {
            changed: hasChanged,
            value: collection[plugin]
        }
    }

    #refreshSettings = () => {
        this.settings = {
            oututs: Object.entries(this.outputs).reduce((acc, [ key, { settings = {} } ]) => {
                const plugin = this.#system.plugins.output[key]
                if (!plugin) return acc
    
                const schema = resolveSchema(plugin.settings, settings) || {}
                const data = getTemplate(schema, settings)
                return { ...acc, [key]: data }
            }, {})
        }

    }

    async calculate(client: Client): Promise<CalculationOutput | null> {
        
        if (!client) return null // No client connected

        const allPlugins = this.#system.plugins

        const activeEvaluations = Object.entries(this.evaluations).filter(([ _, value ]) => value.enabled).map(([key]) => key)
        const plugins = activeEvaluations.reduce((acc, key) => {
            const plugin = allPlugins.evaluation[key]
            if (plugin) acc.push(plugin)
            return acc
        }, []) // Use protocol settings to get active evaluation plugins
        
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
        const activeOutputPluginKeys = Object.entries(this.outputs).filter(([ _, value ]) => value.enabled).map(([key]) => key)

        // Set the feedback from the calculated score and features
        const inputs = { score: normalizedScore, __score: this.#score, ...calculatedFeatures }

        activeOutputPluginKeys.map(async (key) => {

            const plugin = allPlugins.output[key]
            if (!plugin) return

            const settings = this.settings.output[key]

            plugin.__ctx.settings = settings // Set the settings in the context

            await plugin.set.call(
                plugin.__ctx, // Context
                inputs, // Features
            )

            plugin.__latest = inputs // Allow recalculation
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
