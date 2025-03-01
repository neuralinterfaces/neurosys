
// Neurosys Classes
import { Norm } from './norms'
import { Score } from './plugins'

// Utilities
import * as outputs from './outputs'
import * as score from './score'
import * as features from './features'

// Types
import type { FeatureCollection } from './features'
import type { Client } from './plugins/types'


export class Protocol {

    #norm = new Norm()

    features: FeatureCollection = {}

    constructor(featurePlugins: FeatureCollection) {
        this.features = featurePlugins
    }

    async calculate( 
        client?: Client, 
        scorePlugin?: Score 
    ) {

        if (!client || !scorePlugin) return // Invalid inputs
    
        const featureSettings = scorePlugin.features || {}
    
        // Use score plugin to define the features to calculate
        const calculatedFeatures: Record<string, any> = {}
        for (const id in featureSettings) {
        const plugin = this.features[id]
        const settings = featureSettings[id]
        calculatedFeatures[id] = await features.calculate(plugin, settings, client)
        }
    
        // Calculate a score from the provided features
        const rawScore = await score.calculate(scorePlugin, calculatedFeatures)
    
        const normalizedScore = this.#norm.update(rawScore)
    
        // Set the feedback from the calculated score and features
        outputs.set(this.#norm, calculatedFeatures)
    
        return { score: normalizedScore, features: calculatedFeatures }
    }
}