import './style.css'

import { evaluation, outputs, setDeviceDiscoveryHandler, getAllServerSidePlugins, System } from 'neurosys'
import { DeviceList, DeviceDiscoveryList, createModal } from './ui'


const neurosys = new System()

// // Example Search Params: ?output=textFeedback&output=inspectFeedback&score=alphaScore
// const searchParams = new URLSearchParams(window.location.search)

// const urlSettings = {
//     outputs: searchParams.getAll('output').reduce((acc, key) => ({ ...acc, [key]: { enabled: true } }), {}),
//     score: searchParams.getAll('score').reduce((acc, key) => ({ ...acc, [key]: { enabled: true } }), {})
// }

// const hasUrlSettings = Object.values(urlSettings).some((o) => Object.keys(o).length > 0)


const SETTINGS_FILE_PREFIX = 'settings'

const { SERVICES, READY } = commoners

const UPDATE_INVERVAL = 250

const loadStart = performance.now()


READY.then(async ({ menu, settings }) => {
  menu.onSaveSettings(async () => {
      settings.set(SETTINGS_FILE_PREFIX,  neurosys.get()) // Only a single settings file is stored
      menu.enableSettings(false)
  })
})


const MENU_STATES = {
  recording: {
    save: {
      label: 'Save Data',
      enabled: false,
      onClick: () => neurosys.client && neurosys.client.save()
    },
    start: {
      label: 'Start Recording',
      enabled: false,
      onClick: async () => {
        const { menu } = await READY
        if (!neurosys.client) return console.error('No client available')
        menu.update('recording', MENU_STATES.recording.stop)
      }
    },
    stop: {
      label: 'Stop Recording',
      onClick: async () => {
        const { menu } = await READY
        MENU_STATES.recording.save.onClick() // Save the data before stopping
        menu.update('recording', MENU_STATES.recording.start)
      }
    }
  }
}



READY.then(async (PLUGINS) => {

  const { menu, settings } = PLUGINS

  console.log(`Commoners loaded in ${performance.now() - loadStart}ms`)

  await neurosys.register(PLUGINS)

  console.log(`Main plugins loaded in ${performance.now() - loadStart}ms`)

  // Register all service plugins
  // NOTE: Declaring this after the main plugins ensures that the main plugins are loaded with priority
  const urlsByService = Object.entries(SERVICES).reduce((acc, [key, value]) => ({ ...acc, [key]: value.url }), {})
  const servicePlugins = await getAllServerSidePlugins(urlsByService)
  for (const serviceName in servicePlugins) {
    const plugins = servicePlugins[serviceName]
    await neurosys.register(plugins)
  }

  console.log(`Service plugins loaded in ${performance.now() - loadStart}ms`)

  const currentSettings = settings.get(SETTINGS_FILE_PREFIX) // Load settings from the file
  await neurosys.load(currentSettings) // Load settings into the system
  menu.loadSettings(currentSettings) // Update menu with the current settings

  // Start calculating
  setInterval(() => neurosys.calculate(), UPDATE_INVERVAL)

  // menu.add('recording', MENU_STATES.recording.start)
  menu.add('recording', MENU_STATES.recording.save)
  
  neurosys.onDeviceConnected = () => menu.update('recording', { ...MENU_STATES.recording.save, enabled: true })

  const { menu: { onDeviceDisconnect } } = await READY

  onDeviceDisconnect(async () => {
    neurosys.reset() // Reset the system
    menu.update('recording', MENU_STATES.recording.save) // Reset the recording button
    const { menu: { toggleDeviceConnection } } = await READY
    toggleDeviceConnection(true) // Reset the device connection button
  })
  
})

evaluation.onToggle(async (key, enabled) => {

  const { menu } = await READY

  const plugin = neurosys.plugins.evaluation[key]
  plugin.enabled = enabled

  const protocol = neurosys.get()
  const { changed } = protocol.update('evaluations', key, { enabled })
  if (changed) menu.enableSettings(true) // Enable settings save button because of changes

  neurosys.calculate() // Run the protocol immediately after toggling
})

outputs.onToggle(async (key, enabled) => {

  const { menu } = await READY

  const ref = neurosys.plugins.output[key]

  if (!ref) return

  const { __info, __latest } = ref

  const toggledFromPrevState = enabled == !ref.enabled

  const hasNotChanged = !enabled && !toggledFromPrevState

  const callback = enabled ? 'start' : 'stop'
  const info = (ref[callback] && !hasNotChanged) ? (ref.__info = (await ref[callback](__info)) ?? {}) : __info

  // Ensure the appropriate callback is called before the state is toggled
  ref.enabled = enabled
  const protocol = neurosys.get()
  const { changed } = protocol.update('outputs', key, { enabled })
  if (changed) menu.enableSettings(true) // Enable settings save button because of changes

  if (!changed) return
  if (!enabled) return

  ref.set(__latest, info) // Re-set the latest features to the output
})



// Allow Device Type Selection with a User Action (to bypass security restrictions)
READY.then((PLUGINS) => {

  const { menu } = PLUGINS

  menu.showDeviceSelector(async () => {

    const { device, protocol } = await new Promise((resolve, reject) => {
      const list = new DeviceList({
        devices: neurosys.plugins.devices,

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

    neurosys.connect(device, protocol)
    menu.toggleDeviceConnection(false) // Success
  })
})


  setDeviceDiscoveryHandler(async (onSelect) => {

      let device = '';

      const onModalClosed = () => {
        onSelect(device)
        modal.remove()
      }

      const list = new DeviceDiscoveryList({ 
        emptyMessage: 'Searching...',
        onSelect: (deviceId) => {
          device = deviceId
          modal.close()
        } 
      })
    
      const modal = createModal({ title: 'Discovered USB Devices',  content: list })
      document.body.append(modal)
      modal.showModal()

      modal.addEventListener('close', onModalClosed)
    
      
      return (devices) => list.devices = devices

  })