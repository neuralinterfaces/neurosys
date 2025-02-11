import './style.css'

import * as desktop from './desktop'

import { MuseClient, EEG_FREQUENCY, channelNames } from 'muse-js'
import * as bci from 'bcijs/browser.js'

const { DESKTOP, READY } = commoners

const onShowDevices = async (fn: Function) => {
  const { menu: { showDeviceSelector } } = await READY
  showDeviceSelector(fn)
}

let canIgnoreMouseEvents = true

const setIgnoreMouseEvents = async (ignore: boolean) => {
  const { transparent: { setIgnoreMouseEvents } } = await READY
  setIgnoreMouseEvents(ignore)
}

const setMouseNoise = async (level: number) => {
  const { levels: { setMouseNoise } } = await READY
  setMouseNoise(level)
}

const updateAppBrightness = async (score: number) => {
  const level = (1 - score)
  document.body.style.backgroundColor = `rgba(0, 0, 0, ${level})`
}

updateAppBrightness(1)


const registerAsInteractive = async (element: HTMLElement) => {
  element.onmouseover = () => setIgnoreMouseEvents(false)
  element.onmouseout = () => setIgnoreMouseEvents(canIgnoreMouseEvents)
}

const setGeneralScore = async (score: number) => {

  updateAppBrightness(score)

  // Forward the level to a system-level service
  if (DESKTOP) {
    setMouseNoise(score)
    const volumeResult = await desktop.setVolume(score)
    const brightnessResult = await desktop.setBrightness(score)
    const error = volumeResult.error || brightnessResult.error
    if (error) console.error(error)
    return
  }


  // Cannot handle system-level volume control on the web

  console.error('No volume control available')
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

const DEVICES = {
  muse: {
    name: 'Muse 2',
    protocols: [ 'BLE' ],
    connect: async () => {

      let client = new MuseClient();


      const previousDevice = null
      if (DESKTOP && previousDevice) {
        const { bluetooth } = await READY
        bluetooth.match(previousDevice, 5000) // Set device to match on desktop
      }
  
      // options.device = previousDevice
  
      await client.connect();
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

          console.log(powers)

          
          acc[key] = BANDS.reduce((acc, band, idx) => {
            acc[band] = powers[idx]
            return acc
          }, {})

          BANDS.forEach((band) => {
            const el = bandElementsByChannel[key][band]
            console.log('band',key, band, powers[BANDS.indexOf(band)])
            el.style.width = `${powers[BANDS.indexOf(band)] * 100}%`
          })

          return acc
        }, {})

        const score = calculateScore(bandpowers)
        
        setGeneralScore(score)

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

  const modal = createModal({ title: 'Discovered BLE Devices' })
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
