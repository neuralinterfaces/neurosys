import './style.css'

import { score, feedback, features, getClient, setValueInSettings, readyForFeedback } from '../packages/neuro.sys/core/src'

type DataRange = [number, number]

let PREV_DATA_RANGE_FOR_FEATURES = [ 0, 0 ] as DataRange

const SCORE_INTERVAL = 250

const calculateOnDataSlice = async (client: any, dataSlice: DataRange) => {

  // Request the current score plugin
  const plugin = await score.getActivePlugin()

  if (!plugin) return

  // Use score plugin to define the features to calculate
  const calculatedFeatures = await features.calculate(plugin.features, dataSlice, client)

  // Calculate a score from the provided features
  const calculatedScore = await score.calculate(calculatedFeatures)

  // Set the feedback from the calculated score and features
  feedback.set(calculatedScore, calculatedFeatures)
}


readyForFeedback.then(() => {

  setInterval(async () => {
    const client = getClient()
    const data = client ? client.data : {}
    const signalLength = Object.values(data)?.[0]?.length || 0
    const lastDataIdx = PREV_DATA_RANGE_FOR_FEATURES[1]
    const dataSlice = [ lastDataIdx, signalLength ] as DataRange
    PREV_DATA_RANGE_FOR_FEATURES = dataSlice
    calculateOnDataSlice(client, dataSlice)
  }, SCORE_INTERVAL)

  
})


score.onToggle(async (key, enabled) => {
  const plugins = await score.getPlugins()
  const ref = plugins[key]
  ref.enabled = enabled
  await setValueInSettings(`score.${key}.enabled`, enabled)

  const client = getClient()
  calculateOnDataSlice(client, PREV_DATA_RANGE_FOR_FEATURES) // Set the plugin score immediately when toggled
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