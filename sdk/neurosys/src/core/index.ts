import { enableBluetooth, enableSerial } from "./devices/types"

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

export { System } from "./system"

// SSPs
export { getAllServerSidePlugins } from "./services"

// Device Handling
export { setDeviceDiscoveryHandler } from "./devices/types"

// export * from './devices'
export * from './plugins'


enableBluetooth()
enableSerial()