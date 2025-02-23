import { score, outputs, features, getClient } from '../../sdk/neurosys/src/core/index'

const scoreNormalization = {
    min: 0,
    max: 1
}

  
export const calculate = async (
  client: any = getClient(),
) => {

  // Request the current score plugin
  const plugin = await score.getActivePlugin()

  if (!plugin) return

  // Use score plugin to define the features to calculate
  const calculatedFeatures = await features.calculate(plugin.features, client)

  // Calculate a score from the provided features
  const calculatedScore = await score.calculate(calculatedFeatures)


  // Normalize the score between 0 and 1
  if (calculatedScore < scoreNormalization.min) scoreNormalization.min = calculatedScore
  if (calculatedScore > scoreNormalization.max) scoreNormalization.max = calculatedScore

  const { min, max } = scoreNormalization
  const normalizedScore = Math.max(0, Math.min(1, (calculatedScore - min) / (max - min)))

  // Set the feedback from the calculated score and features
  outputs.set(normalizedScore, calculatedFeatures)

  return { score: normalizedScore, features: calculatedFeatures }
}

