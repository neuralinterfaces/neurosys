import './style.css'

// Example Search Params: ?feedback=textFeedback&feedback=inspectFeedback&score=alphaScore
const searchParams = new URLSearchParams(window.location.search)

const urlSettings = {
  feedback: searchParams.getAll('feedback').reduce((acc, key) => ({ ...acc, [key]: { enabled: true } }), {}),
  score: searchParams.getAll('score').reduce((acc, key) => ({ ...acc, [key]: { enabled: true } }), {})
}

const hasUrlSettings = Object.values(urlSettings).some((o) => Object.keys(o).length > 0)

const { READY } = commoners

type DataRange = [number, number]

let data = {} as Record<string, number[]>
let PREV_DATA_RANGE_FOR_FEATURES = [0, 0] as DataRange

const SCORE_INTERVAL = 250

const calculate = async (dataRange: DataRange) => {
  const plugin = await getActiveScorePlugin()
  if (!plugin) return { features: null, score: null }
  const { get, features = {} } = plugin
  const calculatedFeatures = await getFeatures(features, dataRange, client?.sfreq)
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

const setValueInSettings = async (path: string, value: any) => {
  let resolved = await GLOBALS.settings.data
  const segments = path.split('.')
  const lastSegment = segments.pop()
  for (const segment of segments) resolved = resolved[segment] ?? ( resolved[segment] = {} )
  const hasChanged = JSON.stringify(resolved[lastSegment]) !== JSON.stringify(value)
  if (!hasChanged) return
  resolved[lastSegment] = value
  enableSettings(true)
}



const registerAllFeedbackPlugins = async () => {
  const PLUGINS = await READY
  const { menu: { registerFeedback, onFeedbackToggle } } = PLUGINS
  return Object.entries(PLUGINS).reduce((acc, [ key, plugin ]) => {
    const { feedback, enabled, start, stop, set } = plugin

    if (!feedback) return acc
    
    registerFeedback(key, { feedback, enabled })

    const ref = acc[key] = { start, stop, set, enabled, __score: null, __info: {} }

    onFeedbackToggle(key, async (enabled) => {
      const { start, stop, __info, __score } = ref
    
      const toggledFromPrevState = enabled == !ref.enabled
      ref.enabled = enabled
      await setValueInSettings(`feedback.${key}.enabled`, enabled)

      if (!enabled && !toggledFromPrevState) return

      const callback = enabled ? start : stop
      if (callback) ref.__info = (await callback(__info)) ?? {}

      if (__score === null) return
      if (!enabled) return

      ref.set(__score, ref.__info) // Set the plugin score immediately when toggled

    })

    return acc
  }, {})
}

const registerAllScorePlugins = async () => {
  const PLUGINS = await READY
  const { menu: { registerScore, onScoreToggle } } = PLUGINS

  return Object.entries(PLUGINS).reduce((acc, [ key, plugin ]) => {
    const { 
      score,    // Menu Information
      enabled,  // Menu state
      get,      // Score getter
      features  // Features requested
    } = plugin

    if (!score) return acc

    registerScore(key, { score, enabled, })

    const ref = acc[key] = { enabled, get, features }

    onScoreToggle(key, async (enabled) => {
      ref.enabled = enabled
      await setValueInSettings(`score.${key}.enabled`, enabled)
      const { score, features } = await calculate(PREV_DATA_RANGE_FOR_FEATURES)
      setFeedback(score, features) // Set the plugin score immediately when toggled
    })

    return acc
  }, {})
}

const getAllFeaturePlugins = async () => {
  const PLUGINS = await READY

  return Object.entries(PLUGINS).reduce((acc, [ key, plugin ]) => {
    const { feature } = plugin
    if (!feature) return acc
    acc[key] = plugin
    return acc
  }, {})
}

const getAllDevicesFromPlugins = async () => {
  const PLUGINS = await READY
  return Object.values(PLUGINS).reduce((acc, plugin) => {
    const { devices } = plugin
    if (!devices) return acc
    acc.push(...devices)
    return acc
  }, [])
}

const loadSettings = async (data?: Record<string, any>) => {
  const { menu: { loadSettings } } = await READY
  if (!data) data = await GLOBALS.settings.data
  loadSettings(data)
}

const feedbackOptionsPromise = registerAllFeedbackPlugins()
const scoreOptionsPromise = registerAllScorePlugins()
const featurePluginsPromise = getAllFeaturePlugins()
const devicesPromise = getAllDevicesFromPlugins()

feedbackOptionsPromise.then(async () => {
  await scoreOptionsPromise
  loadSettings()
})

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

const enableSettings = async (enabled: boolean) => {
  const { menu: { enableSettings } } = await READY
  enableSettings(enabled)
}

const onSaveSettings = async (fn: Function) => {
  const { menu: { onSaveSettings } } = await READY
  onSaveSettings(fn)
}

const getSettings = async () => {
  const { settings } = await READY
  if (!settings) return {}
  const { get } = settings
  return get('settings')
}

const GLOBALS = {
  settings: {
    name: 'settings',
    data: hasUrlSettings ? urlSettings : getSettings(),
  }
}

onSaveSettings(async () => {
  const { settings: { set } } = await READY
  const { settings: { name, data } } = GLOBALS
  set(name, await data)
  enableSettings(false)
})

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
    plugin.__features = features
    if (plugin.enabled) plugin.set(score, plugin.__info)
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
const getFeatures = async (
  features: UserFeatures, 
  dataRange: DataRange,
  sfreq: number
): Promise<CalculatedFeatures> => {

  const featurePlugins = await featurePluginsPromise

  const results = {}

  for (const [ key, value ] of Object.entries(features)) {
    const plugin = featurePlugins[key]
    if (!plugin) continue
    const { calculate } = plugin
    if (!calculate) continue
    results[key] = await calculate({ data, window: dataRange, sfreq }, value)
  }

  return results

}


// ------------ Handle Devices ------------

let client;
onDeviceDisconnect(async () => {
  await client?.disconnect()
  toggleDeviceConnection(true)
})

// ---------------------------- Allow Device Type Selection with a User Action (to bypass security restrictions) ----------------------------
onShowDevices(async () => {

  const modal = createModal({ title: 'Neurofeedback Devices' })
  const ul = modal.querySelector('ul') as HTMLUListElement

  const devices = await devicesPromise

  devices.map((info) => {
    // Resolve protocols
    const resolvedProtocols = Object.entries(info.protocols ?? {}).map(([ id, protocol ]) => {
      const overrides = typeof protocol === 'string' ? { label: protocol } : {}
      return { ...protocol, ...overrides, id }
    })

    return { ...info, protocols: resolvedProtocols}
  })
  .sort((a,b) => a.name.localeCompare(b.name))
  .sort((a,b) => {

    const firstAnyEnabled = a.protocols.find(({ enabled = true }) => enabled)
    const secondAnyEnabled =  b.protocols.find(({ enabled = true }) => enabled)

    if (!firstAnyEnabled && !secondAnyEnabled) return 0
    if (!firstAnyEnabled && secondAnyEnabled) return 1
    if (firstAnyEnabled && !secondAnyEnabled) return -1
  }).forEach(({ name, category, protocols, connect }) => {

    const li = document.createElement('li')

    const buttons = protocols.map(({ id: protocol, label, enabled = true }) => {
      const button = document.createElement('button')
      button.innerText = label
      if (!enabled) button.setAttribute('disabled', '')
      button.onclick = async () => {
        modal.close()


        // Connect to the device
        data = {} // Reset data
        client = await connect?.({ data, protocol })
        toggleDeviceConnection(false)
      }
      return button
    })

    const label = document.createElement('strong')
    label.innerText = name

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

  modal.addEventListener('close', () => modal.remove())

  return modal
}

const handleBluetoothPluginEvents = async () => {

  const { bluetooth } = await READY
  if (!bluetooth) return
  const { onOpen, onUpdate, select } = bluetooth

  const modal = createModal({ title: 'Discovered Local Devices', emptyMessage: 'Searching...' })
  document.body.append(modal)

  const ul = modal.querySelector('ul') as HTMLUListElement

  let device = '';
  const onModalClosed = () => select(device)

  modal.addEventListener('close', onModalClosed)

  const updateList = (devices) => {
    ul.innerHTML = ''
    devices.forEach(({ deviceName, deviceId }) => {
      const li = document.createElement('li')
      li.setAttribute('device-id', deviceId)
      li.innerText = deviceName
      li.onclick = () => {
        device = deviceId
        modal.close()
      }
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
