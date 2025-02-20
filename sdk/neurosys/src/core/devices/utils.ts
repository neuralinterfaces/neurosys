import { isPluginInNamespace, NAMESPACES, resolvePlugins } from "../commoners/utils"

let devices: any
const registerAllDevices = async () => {
    const PLUGINS = await resolvePlugins()
    return Object.keys(PLUGINS).reduce((acc, key) => {
      if (!isPluginInNamespace(NAMESPACES.devices, key)) return acc
      const { devices } = PLUGINS[key]
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
  