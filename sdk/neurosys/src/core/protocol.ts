
// Neurosys Classes
import { Score } from './score'
import { Evaluate } from './plugins'

// Utilities
import * as outputs from './outputs'
import { calculate as evaluate } from './evaluation'
import * as features from './features'

// Types
import type { FeatureCollection } from './features'
import type { Client } from './plugins/types'


export class Protocol {

    #score = new Score()

    features: FeatureCollection = {}

    constructor(featurePlugins: FeatureCollection) {
        this.features = featurePlugins
    }

    async calculate( 
        client?: Client, 
        evaluation?: Evaluate 
    ) {

        if (!client || !evaluation) return // Invalid inputs
    
        const featureSettings = evaluation.features || {}
    
        // Use evaluation plugin to define the features to calculate
        const calculatedFeatures: Record<string, any> = {}
        for (const id in featureSettings) {
            const plugin = this.features[id]
            const settings = featureSettings[id]
            calculatedFeatures[id] = await features.calculate(plugin, settings, client)
        }
    
        // Calculate a score from the provided features
        const evaluatedMetric = await evaluate(evaluation, calculatedFeatures)
        const normalizedScore = this.#score.update(evaluatedMetric)
    
        // Set the feedback from the calculated score and features
        outputs.set(this.#score, calculatedFeatures)
    
        return { score: normalizedScore, features: calculatedFeatures }
    }
}