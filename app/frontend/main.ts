import './style.css'

// import { score, outputs, features, getClient, setValueInSettings, readyToOutputFeedback } from 'neurosys'
import { score, outputs, features, getClient, setValueInSettings, readyToOutputFeedback, setDeviceRequestHandler } from '../../sdk/neurosys/src/core/index'
import { DeviceList, DeviceDiscoveryList, createModal } from './ui'

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

  const { min, max } = scoreNormalization
  const normalizedScore = Math.max(0, Math.min(1, (calculatedScore - min) / (max - min)))

  // Set the feedback from the calculated score and features
  outputs.set(normalizedScore, calculatedFeatures)


}


readyToOutputFeedback.then(() => setInterval(calculate, UPDATE_INVERVAL))

score.onToggle(async (key, enabled) => {
  const plugins = await score.getPlugins()
  const ref = plugins[key]
  ref.enabled = enabled
  await setValueInSettings(`score.${key}.enabled`, enabled)
  calculate() // Set the plugin score immediately when toggled
})

outputs.onToggle(async (key, enabled) => {

      const plugins = await outputs.getPlugins()
      const ref = plugins[key]

      if (!ref) return

      const { start, stop, __info, __score } = ref
    
      const toggledFromPrevState = enabled == !ref.enabled

      const hasNotChanged = !enabled && !toggledFromPrevState

      const callback = enabled ? start : stop
      if (callback && !hasNotChanged) ref.__info = (await callback(__info)) ?? {}

      // Ensure the appropriate callback is called before the state is toggled
      ref.enabled = enabled
      await setValueInSettings(`outputs.${key}.enabled`, enabled)

      if (hasNotChanged) return
      if (__score === null) return
      if (!enabled) return

      ref.set(__score, ref.__info) // Set the plugin score immediately when toggled
  })


  setDeviceRequestHandler(async (devices) => {

    return new Promise((resolve, reject) => {

        const list = new DeviceList({ 
          devices, 

          // Success
          onSelect: async (device, protocol) => {
            resolve({ device, protocol })
            modal.close()
          } 
        })
      
        const modal = createModal({ title: 'Neurofeedback Devices', content: list })
      
        modal.addEventListener('close', () => {
          modal.remove()
          reject('No device selected')
        })
      
        document.body.append(modal)
        modal.showModal()
      })

  })