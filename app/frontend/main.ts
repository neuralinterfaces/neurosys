import './style.css'

// import { score, outputs, features, getClient, setValueInSettings } from 'neurosys'
import { score, outputs, setValueInSettings, setDeviceRequestHandler, registerPlugins, requestAllServicePlugins, loadSettings } from '../../sdk/neurosys/src/core/index'
import { DeviceList, DeviceDiscoveryList, createModal } from './ui'
import { calculate } from './calculate'


const { SERVICES, READY } = commoners

const UPDATE_INVERVAL = 250

const loadStart = performance.now()

READY.then(async (PLUGINS) => {

  console.log(`Commoners loaded in ${performance.now() - loadStart}ms`)

  await registerPlugins(PLUGINS)

  console.log(`Main plugins loaded in ${performance.now() - loadStart}ms`)

  // Register all service plugins
  const urlsByService = Object.entries(SERVICES).reduce((acc, [key, value]) => ({...acc, [key]: value.url}), {})
  const servicePlugins = await requestAllServicePlugins(urlsByService)
  for (const serviceName in servicePlugins) {
    const plugins = servicePlugins[serviceName]
    await registerPlugins(plugins)
  }

  console.log(`Service plugins loaded in ${performance.now() - loadStart}ms`)

  // Load settings after all services are available
  loadSettings()


  // Start calculating
  setInterval(calculate, UPDATE_INVERVAL)

})

score.onToggle(async (key, enabled) => {
  const state = score.togglePlugin(key, enabled)
  await setValueInSettings(`score.${key}.enabled`, state)
  calculate() // Set the plugin score immediately when toggled
})

outputs.onToggle(async (key, enabled) => {

      const ref = outputs.getPlugin(key)

      if (!ref) return

      const { __info, __latest } = ref
    
      const toggledFromPrevState = enabled == !ref.enabled

      const hasNotChanged = !enabled && !toggledFromPrevState

      const callback = enabled ? 'start' : 'stop'
      const info = (ref[callback] && !hasNotChanged) ? (ref.__info = (await ref[callback](__info)) ?? {}) : __info

      // Ensure the appropriate callback is called before the state is toggled
      const state = outputs.togglePlugin(key, enabled)
      await setValueInSettings(`outputs.${key}.enabled`, state)

      if (hasNotChanged) return
      if (!state) return

      ref.set(__latest, info) // Set the plugin score immediately when toggled
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