import { resolvePlugins } from "../commoners"
import { getPluginType } from "../plugins"

let devices: any
const registerAllDevices = async () => {
    const PLUGINS = await resolvePlugins()
    return Object.entries(PLUGINS).reduce((acc, [ key, plugin ]) => {
      const type = getPluginType(key, plugin)
      if (type !== 'device') return acc
      const { devices } = plugin
      acc.push(...devices)
      return acc
    }, [])
}

export const getAllDevices = async () => devices ?? (devices = registerAllDevices())

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
  