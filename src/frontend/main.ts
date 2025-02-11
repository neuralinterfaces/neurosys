import './style.css'

import { MuseClient, EEG_FREQUENCY, channelNames } from 'muse-js'
import * as bci from 'bcijs/browser.js'

const { DESKTOP, READY } = commoners


const registerAllFeedbackPlugins = async () => {
  const PLUGINS = await READY
  const { menu: { registerFeedback, onToggle } } = PLUGINS
  return Object.entries(PLUGINS).reduce((acc, [ key, plugin ]) => {
    const { feedbackInfo, enabled, set } = plugin

    if (!feedbackInfo) return acc
    
    registerFeedback(key, { feedbackInfo, enabled })

    const ref = acc[key] = { enabled, set, __score: 1 }

    onToggle(key, (enabled) => {
      ref.enabled = enabled
      ref.set(ref.__score) // Set the plugin score immediately when toggled
    })

    return acc
  }, {})
}

const feedbackOptionsPromise = registerAllFeedbackPlugins()

const onShowDevices = async (fn: Function) => {
  const { menu: { showDeviceSelector } } = await READY
  showDeviceSelector(fn)
}

const toggleDeviceConnection = async (on: boolean = true) => {
  const { menu: { toggleDeviceConnection } } = await READY
  toggleDeviceConnection(on)
}

const onDeviceDisconnect = async (fn: Function) => {
  const { menu: { onDeviceDisconnect } } = await READY
  onDeviceDisconnect(fn)
}

let canIgnoreMouseEvents = true

const setIgnoreMouseEvents = async (ignore: boolean) => {
  const { systemOverlay } = await READY
  if (!systemOverlay) return
  const { setIgnoreMouseEvents } = systemOverlay
  setIgnoreMouseEvents(ignore)
}

const registerAsInteractive = async (element: HTMLElement) => {
  element.onmouseover = () => setIgnoreMouseEvents(false)
  element.onmouseout = () => setIgnoreMouseEvents(canIgnoreMouseEvents)
}

const setFeedback = async (score: number) => {
  const feedbackOptions = await feedbackOptionsPromise
  for (const [ key, plugin ] of Object.entries(feedbackOptions)) plugin.set(plugin.__score = score)
}

const BAND_CALCULATION_INTERVAL = 250

const calculateScore = (features: any) => {
  const averageAlphaRatio = Object.values(features).reduce((acc, { alpha }) => acc + alpha, 0) / Object.keys(features).length
  const score = 10 * averageAlphaRatio // Lots of frequencies outside of alpha band. Blinks make this go wild...
  return Math.min(1, Math.max(0, score))
}


const BANDS = [
  // 'delta', 
  // 'theta', 
  'alpha', 
  'beta', 
  // 'gamma'
]

const channelsContainer = document.createElement('div')
channelsContainer.id = 'channels-container'

const bandElementsByChannel = channelNames.reduce((acc, name) => {
  const channelElement = document.createElement('div')
  channelElement.id = name
  channelElement.classList.add('channel')

  const bandElements = BANDS.reduce((acc, band) => {
    const bandElement = document.createElement('div')
    bandElement.id = `${name}-${band}`
    bandElement.className = `band ${band}`
    acc[band] = bandElement
    return acc
  }, {})

  const header = document.createElement('strong')
  header.innerText = name

  const bandsContainer = document.createElement('div')
  bandsContainer.classList.add('bands')
  bandsContainer.append(...Object.values(bandElements))
  channelElement.append(header, bandsContainer)

  channelsContainer.appendChild(channelElement)

  acc[name] = bandElements

  return acc

}, {})

document.body.appendChild(channelsContainer)


// ------------ Handle Devices ------------

let client;
onDeviceDisconnect(async () => {
  await client?.disconnect()
  toggleDeviceConnection(true)
})

const DEVICES = {
  muse: {
    name: 'Muse 2',
    protocols: [ 'Bluetooth' ],
    connect: async () => {

      client = new MuseClient();

      const previousDevice = null
      if (DESKTOP && previousDevice) {
        const { bluetooth } = await READY
        bluetooth.match(previousDevice, 5000) // Set device to match on desktop
      }
  
      // options.device = previousDevice
  
      await client.connect();
      toggleDeviceConnection(false)
      
      await client.start();
  

      const data = {} as Record<string, number[]>
      client.eegReadings.subscribe(({ electrode, samples }) => {
        const chName = channelNames[electrode]
        const signal = data[chName] || ( data[chName] = [])
        signal.push(...samples)
      });


      let lastIdx = 0

      setInterval(() => {

        const signalLength = Object.values(data)[0].length
        const dataSlice = [ lastIdx, signalLength ]
        lastIdx = signalLength

        const bandpowers = Object.entries(data).reduce((acc, [key, value ]) => {

          const sliced = value.slice(...dataSlice)

          const powers = bci.bandpower(
            sliced,
            EEG_FREQUENCY,
            BANDS,
            { relative: true }
          );
          
          acc[key] = BANDS.reduce((acc, band, idx) => {
            acc[band] = powers[idx]
            return acc
          }, {})

          BANDS.forEach((band) => {
            const el = bandElementsByChannel[key][band]
            el.style.width = `${powers[BANDS.indexOf(band)] * 100}%`
          })

          return acc
        }, {})

        const score = calculateScore(bandpowers)
        
        setFeedback(score)

      }, BAND_CALCULATION_INTERVAL)
  
    }
  }
}


const startSearchForDevice = async (device: string, protocol: string) => {
  const deviceInfo = DEVICES[device]
  if (!deviceInfo) return console.error('Unknown device', device)
  await deviceInfo.connect()
}

// ---------------------------- Allow Device Type Selection with a User Action (to bypass security restrictions) ----------------------------
onShowDevices(() => {

  const modal = createModal({ title: 'EEG Devices' })
  const ul = modal.querySelector('ul') as HTMLUListElement


  Object.entries(DEVICES).forEach(([identifier, { name, protocols }]) => {
    const li = document.createElement('li')

    const buttons = protocols.map((protocol) => {
      const button = document.createElement('button')
      button.innerText = protocol
      button.onclick = () => {
        modal.close()
        startSearchForDevice(identifier, protocol)
      }
      return button
    })

    const title = document.createElement('h3')
    title.innerText = name || identifier

    const buttonDiv = document.createElement('div')
    buttonDiv.append(...buttons)
    li.append(title, buttonDiv)
    ul.appendChild(li)
  })

  document.body.append(modal)
  modal.showModal()
})

const createModal = ({ title }: { title: string }) => {

  const modal = document.createElement('dialog')
  registerAsInteractive(modal)

  const header = document.createElement('h2')
  header.innerText = title
  const ul = document.createElement('ul')
  modal.appendChild(header)
  modal.appendChild(ul)

  // Dismiss modal if user clicks outside on the backdrop
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close()
  });

  return modal
}

const handleBluetoothPluginEvents = async () => {

  const { bluetooth: { onOpen, onUpdate, select } } = await READY

  const modal = createModal({ title: 'Discovered Bluetooth Devices' })
  document.body.append(modal)

  const ul = modal.querySelector('ul') as HTMLUListElement

  const closeModal = (device?: string) => {
    modal.close()
    select(device || '')
  }

  const updateList = (devices) => {
    ul.innerHTML = ''
    devices.forEach(({ deviceName, deviceId }) => {
      const li = document.createElement('li')
      li.innerText = deviceName
      li.onclick = () => closeModal(deviceId)
      ul.appendChild(li)
    })
  }

  let latestDevices = ''
  onOpen(() => modal.showModal())

  onUpdate((devices) => {
    if (latestDevices !== JSON.stringify(devices)) {
      latestDevices = JSON.stringify(devices)
      updateList(devices)
    }
  })
}

handleBluetoothPluginEvents()
