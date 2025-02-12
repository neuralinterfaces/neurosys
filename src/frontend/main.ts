import './style.css'

import { MuseClient, EEG_FREQUENCY, channelNames } from 'muse-js'
import * as bci from 'bcijs/browser.js'
import { createBandpowerVisualization } from './visualization/bandpowers'

const { DESKTOP, READY } = commoners

type DataRange = [number, number]

let data = {} as Record<string, number[]>
let PREV_DATA_RANGE_FOR_FEATURES = [0, 0] as DataRange

const SCORE_INTERVAL = 250

const calculate = async (dataRange: DataRange) => {
  const plugin = await getActiveScorePlugin()
  if (!plugin) return { features: null, score: null }
  const { get, features = {} } = plugin
  const calculatedFeatures = getFeatures(features, dataRange)
  const score = get(calculatedFeatures)
  return { features: calculatedFeatures, score  }
}

setInterval(async () => {
  const signalLength = Object.values(data)?.[0]?.length || 0
  const lastDataIdx = PREV_DATA_RANGE_FOR_FEATURES[1]
  const dataSlice = [ lastDataIdx, signalLength ] as DataRange
  PREV_DATA_RANGE_FOR_FEATURES = dataSlice

  const { score, features } = await calculate(dataSlice)
  setFeedback(score, features)
}, SCORE_INTERVAL)


const registerAllFeedbackPlugins = async () => {
  const PLUGINS = await READY
  const { menu: { registerFeedback, onFeedbackToggle } } = PLUGINS
  return Object.entries(PLUGINS).reduce((acc, [ key, plugin ]) => {
    const { feedback, enabled, start, stop, set } = plugin

    if (!feedback) return acc
    
    registerFeedback(key, { feedback, enabled })

    const ref = acc[key] = { start, stop, set, enabled, __score: null, __info: {} }

    onFeedbackToggle(key, async (enabled) => {
      const { start, stop, __info, __score, __features } = ref

      ref.enabled = enabled

      const callback = enabled ? start : stop
      if (callback) ref.__info = (await callback(__info)) ?? {}

      if (__score === null) return
      if (!enabled) return

      ref.set({
        score: __score,
        features: __features,
        info: ref.__info
      }) // Set the plugin score immediately when toggled

    })

    return acc
  }, {})
}

const registerAllScorePlugins = async () => {
  const PLUGINS = await READY
  const { menu: { registerScore, onScoreToggle } } = PLUGINS

  return Object.entries(PLUGINS).reduce((acc, [ key, plugin ]) => {
    const { score, enabled, features, get } = plugin

    if (!score) return acc

    registerScore(key, { score, enabled })

    const ref = acc[key] = { enabled, get, features,  __features: {} }

    onScoreToggle(key, async (enabled) => {
      ref.enabled = enabled
      const { score, features } = await calculate(PREV_DATA_RANGE_FOR_FEATURES)
      setFeedback(score, features) // Set the plugin score immediately when toggled
    })

    return acc
  }, {})
}

const feedbackOptionsPromise = registerAllFeedbackPlugins()
const scoreOptionsPromise = registerAllScorePlugins()

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

const setFeedback = async (score: number, features: any) => {

  if (score === null && features === null) return // No active score plugin

  const feedbackOptions = await feedbackOptionsPromise
  for (const [ key, plugin ] of Object.entries(feedbackOptions)) {
    plugin.__score = score // Always set score
    if (plugin.enabled) plugin.set({ score, features, info: plugin.__info })
  }
}

type UserFeatures = {
  bands: string[]
}

type FeaturesByChannel<T> = Record<string, T>

type CalculatedFeatures = {
  bands?: FeaturesByChannel<Record<string, number>>
}

const getActiveScorePlugin = async () => {
  const scoreOptions = await scoreOptionsPromise
  return Object.values(scoreOptions).find(({ enabled }) => enabled)
}


// ------------ Calculate Score ------------
const getFeatures = (features: UserFeatures, dataRange: DataRange): CalculatedFeatures => {

  return Object.entries(features).reduce((acc, [ key, value ]) => {

    if (key === 'bands') {

      acc.bands = Object.entries(data).reduce((acc, [ ch, chData ]) => {

          const sliced = chData.slice(...dataRange)

          const powers = bci.bandpower(
            sliced,
            EEG_FREQUENCY,
            value,
            { relative: true }
          )

          acc[ch] = value.reduce((acc, band, idx) => {
            acc[band] = powers[idx]
            return acc
          }, {})

          return acc

        }, {})

    }

    return acc
  }, {})

}


// ------------ Handle Devices ------------

let client;
onDeviceDisconnect(async () => {
  await client?.disconnect()
  toggleDeviceConnection(true)
})

const PROTOCOL_LABELS = {
  bluetooth: 'Bluetooth',
  usb: 'USB'
}

const DEVICES = {
  muse: {
    name: 'Muse',
    category: 'EEG',
    protocols: [ 'bluetooth' ],
    connect: async () => {

      client = new MuseClient();

      const previousDevice = null
      if (DESKTOP && previousDevice) {
        const { bluetooth } = await READY
        bluetooth.match(previousDevice, 5000) // Set device to match on desktop
      }
  
      // options.device = previousDevice

      data = {} // Reset data
      await client.connect();
      toggleDeviceConnection(false)
      
      await client.start();
  

      client.eegReadings.subscribe(({ electrode, samples }) => {
        const chName = channelNames[electrode]
        const signal = data[chName] || ( data[chName] = [])
        signal.push(...samples)
      });
  
    }
  },
  openbci: {
    name: 'OpenBCI',
    category: 'EEG',
    protocols: [ { type: 'usb', enabled: false } ]
  },
  mendi: {
    name: 'Mendi',
    category: 'fNIRS',
    protocols: [ { type: 'bluetooth', enabled: false } ]
  },
  hegduino: {
    name: 'HEGduino',
    category: 'fNIRS',
    protocols: [ 
      { type: 'usb', enabled: false },
      { type: 'bluetooth', enabled: false }
    ],
  }
}


const startSearchForDevice = async (device: string, protocol: string) => {
  const deviceInfo = DEVICES[device]
  if (!deviceInfo) return console.error('Unknown device', device)
  await deviceInfo.connect()
}

type ProtocolInfo = {
  type: string,
  enabled?: boolean
}

// ---------------------------- Allow Device Type Selection with a User Action (to bypass security restrictions) ----------------------------
onShowDevices(() => {

  const modal = createModal({ title: 'Neurofeedback Devices' })
  const ul = modal.querySelector('ul') as HTMLUListElement


  Object.entries(DEVICES).forEach(([identifier, { name, category, protocols = [] }]) => {
    const li = document.createElement('li')

    const buttons = protocols.map((protocol) => {
      const info = typeof protocol === 'string' ? { type: protocol } : protocol
      const { type, enabled = true } = info as ProtocolInfo
      const label = PROTOCOL_LABELS[type] || type
      const button = document.createElement('button')
      button.innerText = label
      if (!enabled) button.setAttribute('disabled', '')
      button.onclick = () => {
        modal.close()
        startSearchForDevice(identifier, type)
      }
      return button
    })

    const label = document.createElement('strong')
    label.innerText = name || identifier

    const buttonDiv = document.createElement('div')
    buttonDiv.classList.add('buttons')
    buttonDiv.append(...buttons)
    
    li.append(label, buttonDiv)
    ul.appendChild(li)
  })

  document.body.append(modal)
  modal.showModal()
})

const createModal = ({ title, emptyMessage = '' }: { 
  title: string,
  emptyMessage?: string
}) => {

  const modal = document.createElement('dialog')
  registerAsInteractive(modal)

  const header = document.createElement('header')
  header.innerText = title
  modal.appendChild(header)

  const main = document.createElement('main')
  modal.appendChild(main)

  const footer = document.createElement('footer')
  modal.appendChild(footer)

  const ul = document.createElement('ul')
  ul.setAttribute('empty-message', emptyMessage)
  main.appendChild(ul)

  // Dismiss modal if user clicks outside on the backdrop
  modal.addEventListener('click', (event) => {
    const target = event.target as Node
    if (target === modal) modal.close()
  });

  return modal
}

const handleBluetoothPluginEvents = async () => {

  const { bluetooth: { onOpen, onUpdate, select } } = await READY

  const modal = createModal({ title: 'Discovered Local Devices', emptyMessage: 'Searching...' })
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
      li.setAttribute('device-id', deviceId)
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
