import './style.css'

import { score, feedback, features, getClient, setValueInSettings, readyForFeedback } from '../packages/neuro.sys/core/src'

const UPDATE_INVERVAL = 250

let scoreNormalization = {
  min: 0,
  max: 1
}

const calculate = async (
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
  
  const normalizedScore = Math.max(0, Math.min(1, (calculatedScore - scoreNormalization.min) / (scoreNormalization.max - scoreNormalization.min)))
  console.log(normalizedScore)

  // Set the feedback from the calculated score and features
  feedback.set(calculatedScore, calculatedFeatures)


}


readyForFeedback.then(() => setInterval(calculate, UPDATE_INVERVAL))

score.onToggle(async (key, enabled) => {
  const plugins = await score.getPlugins()
  const ref = plugins[key]
  ref.enabled = enabled
  await setValueInSettings(`score.${key}.enabled`, enabled)
  calculate() // Set the plugin score immediately when toggled
})

feedback.onToggle(async (key, enabled) => {

      const plugins = await feedback.getPlugins()
      const ref = plugins[key]

      const { start, stop, __info, __score } = ref
    
      const toggledFromPrevState = enabled == !ref.enabled

      const hasNotChanged = !enabled && !toggledFromPrevState

      const callback = enabled ? start : stop
      if (callback && !hasNotChanged) ref.__info = (await callback(__info)) ?? {}

      // Ensure the appropriate callback is called before the state is toggled
      ref.enabled = enabled
      await setValueInSettings(`feedback.${key}.enabled`, enabled)

      if (hasNotChanged) return
      if (__score === null) return
      if (!enabled) return

      ref.set(__score, ref.__info) // Set the plugin score immediately when toggled
  })