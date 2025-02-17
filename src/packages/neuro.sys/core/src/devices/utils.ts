import { resolvePlugins } from "../commoners"

let devices: any
const registerAllDevices = async () => {
    const PLUGINS = await resolvePlugins()
    return Object.values(PLUGINS).reduce((acc, plugin = {}) => {
      const { devices } = plugin
      if (!devices) return acc
      acc.push(...devices)
      return acc
    }, [])
}

export const getAllDevices = async () => devices ?? (devices = await registerAllDevices())

export const onShowDevices = async (fn: Function) => {
    const { menu: { showDeviceSelector } } = await resolvePlugins()
    showDeviceSelector(fn)
  }
  
  export const toggleDeviceConnection = async (on: boolean = true) => {
    const { menu: { toggleDeviceConnection } } = await resolvePlugins()
    toggleDeviceConnection(on)
  }
  
  export const onDeviceDisconnect = async (fn: Function) => {
    const { menu: { onDeviceDisconnect } } = await resolvePlugins()
    onDeviceDisconnect(fn)
  }
  