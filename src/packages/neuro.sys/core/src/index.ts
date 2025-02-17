import { DeviceList } from "./components/DeviceList"
import { enableBluetooth, enableSerial } from "./devices/types"

import { getAllDevices, onDeviceDisconnect, onShowDevices, toggleDeviceConnection } from "./devices/utils"
import { loadSettings } from "./settings"
import { createModal } from "./ui"

import * as feedback from './feedback'
import * as score from './score'

export {
    feedback,
    score
}

// export * from './devices'
export * as features from './features'
export * from './settings'
export * from './ui'


let client: null | any = null

export const getClient = () => client
const reset = () => client = null

const promises = [
    feedback.getPlugins(),
    score.getPlugins()
]

// Load settings in Electron after all related plugins have been registered
export const readyForFeedback = Promise.all(promises).then(async () => loadSettings())

// ------------ Default Device Handling Behaviors ------------

onDeviceDisconnect(async () => {
  await client?.disconnect()
  reset()
  toggleDeviceConnection(true)
  client = null
})

// Allow Device Type Selection with a User Action (to bypass security restrictions)
onShowDevices(async () => {

  const devices = await getAllDevices()

  const list = new DeviceList({ 
    devices, 

    // Connect to the device
    onSelect: async ({ connect }, protocol) => {

      modal.close() // Close modal
      reset()
      const states = { data: {}, timestamps: [] }
      client = await connect?.({ ...states, protocol })
      Object.assign(client, states)
      toggleDeviceConnection(false) // Success
    } 
  })

  const modal = createModal({ title: 'Neurofeedback Devices', content: list })

  modal.addEventListener('close', () => modal.remove())

  document.body.append(modal)
  modal.showModal()
})

enableBluetooth()
enableSerial()