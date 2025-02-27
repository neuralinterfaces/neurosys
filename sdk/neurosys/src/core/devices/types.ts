import { resolvePlugins } from "../commoners";



type DeviceDiscoveryHandler = (devices: any) => any | Promise<any> // Device
let deviceDiscoveryHandler: null | DeviceDiscoveryHandler = null
export const setDeviceDiscoveryHandler = async (callback: DeviceDiscoveryHandler) => deviceDiscoveryHandler = callback

export const enableSerial = async () => {

    const { serial } = await resolvePlugins()
    if (!serial) return
    const { onRequest, select, onDeviceAdded, onDeviceRemoved } = serial
  
    const transformDevices = (devices: any[]) => devices.map(o => ({
      name: o.displayName ?? o.portName,
      info: o.displayName ? o.portName : '',
      id: o.portId
    }))
  
    let deviceUpdateHandler: any = null
    let allDevices: any[] = []

    onRequest(async (devices) => {
      allDevices = transformDevices(devices)
      if (!deviceDiscoveryHandler) return console.error('No device discovery handler set')
      deviceUpdateHandler = await deviceDiscoveryHandler(select) // Opening the modal
      deviceUpdateHandler(allDevices)
    })
  
    onDeviceAdded((device) => deviceUpdateHandler && deviceUpdateHandler([...allDevices, ...transformDevices([ device ])]))
        
    onDeviceRemoved((device) => deviceUpdateHandler && deviceUpdateHandler(allDevices.filter(({ id }) => id !== device.portId)))
  }
  
export const enableBluetooth = async () => {
  
    const { bluetooth } = await resolvePlugins()
    if (!bluetooth) return
    const { onOpen, onUpdate, select } = bluetooth

     
    let deviceUpdateHandler: any = null

    onOpen(async () => {
      if (!deviceDiscoveryHandler) return console.error('No device discovery handler set')
      deviceUpdateHandler = await deviceDiscoveryHandler(select) // Opening the modal
    })
  
    let latestDevices = ''
  
    onUpdate((devices) => {
      
      if (latestDevices !== JSON.stringify(devices)) {

        latestDevices = JSON.stringify(devices)

        const mappedDevices = devices.map(o => ({
          name: o.deviceName,
          id: o.deviceId
        }))

        deviceUpdateHandler && deviceUpdateHandler(mappedDevices)
        
      }
    })
  }
  