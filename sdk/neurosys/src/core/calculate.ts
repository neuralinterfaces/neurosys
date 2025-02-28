import { Norm } from './norms'
import { Client } from './plugins/types'
import * as outputs from './outputs'
import * as score from './score'
import * as features from './features'
import { Score } from './plugins'

const norm = new Norm()
  
export const calculate = async (
    client: Client,
    scorePlugin?: Score,
    featurePlugins?: Record<string, any>
) => {

  if (!client) return // No client connected yet

  // Request the current score plugin
  if (!scorePlugin) scorePlugin = await score.getActivePlugin()
  if (!scorePlugin) return // No score plugin selected

  const featureSettings = scorePlugin.features || {}
  if (!featurePlugins) featurePlugins = features.getPlugins(featureSettings)

  // Use score plugin to define the features to calculate
  const calculatedFeatures: Record<string, any> = {}
  for (const id in featureSettings) {
    const plugin = featurePlugins[id]
    const settings = featureSettings[id]
    calculatedFeatures[id] = await features.calculate(plugin, settings, client)
  }

  // Calculate a score from the provided features
  const rawScore = await score.calculate(scorePlugin, calculatedFeatures)

  norm.update(rawScore)

  const normalizedScore = norm.normalize(rawScore)

  // Set the feedback from the calculated score and features
  outputs.set(normalizedScore, calculatedFeatures)

  return { score: normalizedScore, features: calculatedFeatures }
}

