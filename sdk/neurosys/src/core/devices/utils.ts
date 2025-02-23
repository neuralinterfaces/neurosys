import { resolvePlugins } from "../commoners"

export const deviceOptions: any[] = []

export const registerDevices = (plugin) => {
  const { devices } = plugin
  deviceOptions.push(...devices)
}

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
  