import { enableBluetooth, enableSerial } from "./devices/types"

import { onDeviceDisconnect, onShowDevices, toggleDeviceConnection } from "./devices/utils"

// System Plugin Utilities
export { setIgnoreMouseEvents } from './interactions'

// Calculation Utilities
export { Score } from "./score"
export { Protocol } from "./protocol"

// Plugin Management
export * as outputs from './outputs'
export * as evaluation from './evaluation'
export * as features from './features'
// import * as devices from './devices/'

// SSPs
export { getAllServerSidePlugins } from "./services"
import { System } from "./system"

// Device Handling
export { setDeviceDiscoveryHandler } from "./devices/types"

// export * from './devices'
export * from './plugins'


export const neurosys = new System()

// ------------ Default Device Handling Behaviors ------------

onDeviceDisconnect(async () => {
  await neurosys.reset() // Ensure disconnection is detected
  toggleDeviceConnection(true)
})


type DeviceRequestHandler = (devices: any) => any // Device
let deviceRequestHandler: null | DeviceRequestHandler = null
export const setDeviceRequestHandler = async (callback: DeviceRequestHandler) => deviceRequestHandler = callback


// Allow Device Type Selection with a User Action (to bypass security restrictions)
onShowDevices(async () => {

  if (!deviceRequestHandler) return console.error('No device request handler set')
    
  const { device, protocol } = await deviceRequestHandler(neurosys.plugins.devices)
  
  neurosys.connect(device, protocol)



  toggleDeviceConnection(false) // Success
})

enableBluetooth()
enableSerial()