import './style.css'

import { getAllServerSidePlugins, System, devices, Recording, Client } from 'neurosys'
import { DeviceList, DeviceDiscoveryList, createModal } from './ui'
// import { JSONSchemaForm } from './ui/JSONSchemaForm'


// // Example Search Params: ?output=textFeedback&output=inspectFeedback&score=alphaScore
// const searchParams = new URLSearchParams(window.location.search)

// const urlSettings = {
//     outputs: searchParams.getAll('output').reduce((acc, key) => ({ ...acc, [key]: { enabled: true } }), {}),
//     score: searchParams.getAll('score').reduce((acc, key) => ({ ...acc, [key]: { enabled: true } }), {})
// }

// const hasUrlSettings = Object.values(urlSettings).some((o) => Object.keys(o).length > 0)



const neurosys = new System()

const calculate = async () => {

  const { __client } = neurosys
  if (!__client) return

  await neurosys.calculate(__client) // Calculate for all protocols

  // const protocol = neurosys.get() // Get the protocol
  // if (!protocol) return
  // await protocol.calculate(client) // Calculate the protocol

}

const SETTINGS_FILE_PREFIX = 'settings'

const { SERVICES, READY } = commoners

const UPDATE_INVERVAL = 250

const loadStart = performance.now()


READY.then(async ({ menu, settings }) => {
  menu.onSaveSettings(async () => {
    const protocol = neurosys.get()
    const copied = JSON.parse(JSON.stringify(protocol))
    settings.set(SETTINGS_FILE_PREFIX, copied) // Only a single settings file is stored
    menu.enableSettings(false)
  })
})


const MENU_STATES = {
  device: {
    connect: {
      label: 'Connect Device',

      // Allow Device Type Selection with a User Action (to bypass security restrictions)
      onClick: async () => {
        const { menu } = await READY
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

        const client = new Client(device)
        await client.connect(protocol)
        neurosys.__client = client

        menu.update('recording', { ...MENU_STATES.recording.start, enabled: true })
        menu.update('device', MENU_STATES.device.disconnect)
      }
    },
    disconnect: {
      label: 'Disconnect Device',
      onClick: async () => {
        const { menu } = await READY
        const { __client } = neurosys
        if (!__client) return
        await __client.disconnect()
        delete neurosys.__client
        neurosys.reset()
        menu.update('recording', MENU_STATES.recording.start)
        menu.update('device', MENU_STATES.device.connect)
      }
    }
  },

  recording: {
    start: {
      label: 'Start Recording',
      enabled: false,
      onClick: async () => {
        const { menu } = await READY
        if (!neurosys.__client) return console.error('No client available')

        neurosys.__recording = new Recording(neurosys.__client)
        neurosys.__recording.start()
        
        menu.update('recording', MENU_STATES.recording.stop)
      }
    },
    stop: {
      label: 'Stop Recording',
      onClick: async () => {
        const { menu } = await READY

        const { __recording } = neurosys
        if (!__recording) return
        __recording.save()
        __recording.stop()
        delete neurosys.__recording

        menu.update('recording', { ...MENU_STATES.recording.start, enabled: true })
      }
    }
  },

  pluginSettings: {
    save: {
      label: 'Edit Plugin Settings',

      onClick: async () => {

           const allOutputPlugins = neurosys.plugins.output
           const elements = Object.entries(allOutputPlugins).map(([ key, plugin ]) => {

              const { label } = plugin

              const formContainer = document.createElement('div')
              formContainer.style.display = 'flex'
              formContainer.style.flexDirection = 'column'
              formContainer.style.gap = '10px'
              formContainer.style.padding = '10px'

              const header = document.createElement('h3')
              header.textContent = label
              formContainer.append(header)

              const { settings: schema = {} } = plugin
              const hasProperties = Object.keys(schema.properties || {}).length > 0

              if (hasProperties) {
                // const form = new JSONSchemaForm({ data: {}, schema })
                const form = document.createElement('form')
                form.textContent = 'Cannot generate form yet...'
                formContainer.append(form)
              }

              else {
                const message = document.createElement('small')
                message.textContent = 'No settings available'
                formContainer.append(message)
              }


              return formContainer
           })

           // Sort by has form
           .sort((a, b) => {  
              const hasFormA = a.querySelector('form')
              const hasFormB = b.querySelector('form')
              return hasFormA && !hasFormB ? -1 : 1
           })


          //  const allProtocols = neurosys.getAll()
          //  allProtocols.forEach((protocol) => {
          //   const outputPlugins = protocol.outputs
          //   const evaluationPlugins = protocol.evaluations
          //   console.log(outputPlugins, evaluationPlugins)
          // })

          const container = document.createElement('div')
          container.style.display = 'flex'
          container.style.flexDirection = 'column'
          container.style.gap = '10px'
          container.append(...elements)
        
          const modal = createModal({ 
            title: 'Plugin Settings', 
            content: container
          })

          document.body.append(modal)
          modal.showModal()

          modal.addEventListener('close', () => modal.remove())

      }
    }
  }
}


const registerInMenu = async (collectedPlugins: Record<string, any>) => {

  const { menu: { registerOutput, registerEvaluation } } = await commoners.READY // Get registration functions
  const { output = {}, evaluation = {} } = collectedPlugins
  for (const identifier in output) {
    const { label, enabled } = output[identifier]
    registerOutput(identifier, { label, enabled })
  }

  for (const identifier in evaluation) {
    const { label, enabled } = evaluation[identifier]
    registerEvaluation(identifier, { label, enabled })
  }
}

READY.then(async (PLUGINS) => {

  const { menu, settings } = PLUGINS

  console.log(`Commoners loaded in ${performance.now() - loadStart}ms`)

  const collected = neurosys.register(PLUGINS)
  await registerInMenu(collected)

  console.log(`Main plugins loaded in ${performance.now() - loadStart}ms`)

  // Register all service plugins
  // NOTE: Declaring this after the main plugins ensures that the main plugins are loaded with priority
  const urlsByService = Object.entries(SERVICES).reduce((acc, [key, value]) => ({ ...acc, [key]: value.url }), {})
  const servicePlugins = await getAllServerSidePlugins(urlsByService)
  for (const serviceName in servicePlugins) {
    const plugins = servicePlugins[serviceName]
    const collected = neurosys.register(plugins)
    await registerInMenu(collected)
  }

  console.log(`Service plugins loaded in ${performance.now() - loadStart}ms`)

  const currentSettings = settings.get(SETTINGS_FILE_PREFIX) // Load settings from the file
  await neurosys.load(currentSettings) // Load settings into the system
  menu.loadSettings(currentSettings) // Update menu with the current settings

  // Start calculating
  setInterval(calculate, UPDATE_INVERVAL)

  for (const [ key, states ] of Object.entries(MENU_STATES))menu.add(key, Object.values(states)[0]) // Add the first state of each menu option

})

// -------------------- Electron Menu Callbacks --------------------
READY.then(async (PLUGINS) => {

  const { menu, bluetooth, serial } = PLUGINS


  if (bluetooth) devices.enableBluetooth(bluetooth)
  if (serial) devices.enableSerial(serial)

  menu.onEvaluationToggle(async (key, enabled) => {

    const plugin = neurosys.plugins.evaluation[key]
    plugin.enabled = enabled

    const protocol = neurosys.get()
    const { changed } = protocol.update('evaluations', key, { enabled })
    if (changed) menu.enableSettings(true) // Enable settings save button because of changes

    calculate() // Run the protocol immediately after toggling
  })

  menu.onOutputToggle(async (key, enabled) => {

    const { menu } = await READY

    const ref = neurosys.plugins.output[key]

    if (!ref) return

    const { __ctx, __latest } = ref

    const toggledFromPrevState = enabled == !ref.enabled

    const hasNotChanged = !enabled && !toggledFromPrevState

    const callback = enabled ? 'start' : 'stop'
    if (ref[callback] && !hasNotChanged) await ref[callback].call(__ctx)

    // Ensure the appropriate callback is called before the state is toggled
    ref.enabled = enabled
    const protocol = neurosys.get()
    const { changed } = protocol.update('outputs', key, { enabled })
    if (changed) menu.enableSettings(true) // Enable settings save button because of changes

    if (!changed) return
    if (!enabled) return
    if (!__latest) return

    ref.set.call(__ctx, __latest) // Re-set the latest features to the output
  })
})

devices.setDeviceDiscoveryHandler(async (onSelect) => {

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

  const modal = createModal({ title: 'Discovered USB Devices', content: list })
  document.body.append(modal)
  modal.showModal()

  modal.addEventListener('close', onModalClosed)


  return (devices) => list.devices = devices

})