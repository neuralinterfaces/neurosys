import { score, outputs, features, getClient } from 'neurosys'

const scoreNormalization = {
    min: 0,
    max: 1
}

  
export const calculate = async (
  client: any = getClient(),
) => {

  if (!client) return // No client connected yet

  // Request the current score plugin
  const scorePlugin = await score.getActivePlugin()
  if (!scorePlugin) return // No score plugin selected

  const featureSettings = scorePlugin.features
  const featurePlugins = features.getPlugins(featureSettings)

  // Use score plugin to define the features to calculate
  const calculatedFeatures: Record<string, any> = {}
  for (const id in featurePlugins) {
    const plugin = featurePlugins[id]
    const settings = featureSettings[id]
    calculatedFeatures[id] = await features.calculate(plugin, settings, client)
  }

  // Calculate a score from the provided features
  const rawScore = await score.calculate(scorePlugin, calculatedFeatures)

  const { min: ogMin, max: ogMax } = scoreNormalization
  
  // Normalize the score between 0 and 1
  const lessThanMin = ogMin === undefined ? true : rawScore < ogMin 
  const greaterThanMax = ogMax === undefined ? true : rawScore > ogMax
  scoreNormalization.min = lessThanMin ? rawScore : scoreNormalization.min
  scoreNormalization.max = greaterThanMax ? rawScore : scoreNormalization.max

  const { min, max } = scoreNormalization

  const normalizedScore = Math.max(0, Math.min(1, (rawScore - min) / (max - min)))

  // Set the feedback from the calculated score and features
  outputs.set(normalizedScore, calculatedFeatures)

  return { score: normalizedScore, features: calculatedFeatures }
}

