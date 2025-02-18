import { resolvePlugins } from "../commoners/utils";
import { DeviceDiscoveryList } from "../components/DeviceDiscoveryList";
import { createModal } from "../ui";

export const enableSerial = async () => {

    const { serial } = await resolvePlugins()
    if (!serial) return
    const { onRequest, select, onDeviceAdded, onDeviceRemoved } = serial
  
  
    let device = '';
    const onModalClosed = () => select(device)
  
    const list = new DeviceDiscoveryList({ 
      emptyMessage: 'Searching...',
      onSelect: (deviceId) => {
        device = deviceId
        modal.close()
      } 
    })
  
    const modal = createModal({ title: 'Discovered USB Devices',  content: list })
    document.body.append(modal)
  
    modal.addEventListener('close', onModalClosed)
  
    const transformDevices = (devices: any[]) => devices.map(o => ({
      name: o.displayName ?? o.portName,
      info: o.displayName ? o.portName : '',
      id: o.portId
    }))
  
    onRequest((devices) => {
      modal.showModal()
      list.devices = transformDevices(devices)
    })
  
    onDeviceAdded((device) => list.devices = [...list.devices, ...transformDevices([ device ])])
  
    onDeviceRemoved((device ) => list.devices = list.devices.filter(({ id }) => id !== device.portId))
  }
  
export const enableBluetooth = async () => {
  
    const { bluetooth } = await resolvePlugins()
    if (!bluetooth) return
    const { onOpen, onUpdate, select } = bluetooth
  
    let device = '';
    const onModalClosed = () => select(device)
  
    const list = new DeviceDiscoveryList({ 
      emptyMessage: 'Searching...',
      onSelect: (deviceId) => {
        device = deviceId
        modal.close()
      } 
    })
  
    const modal = createModal({ title: 'Discovered Bluetooth Devices',  content: list })
  
    document.body.append(modal)
  
    modal.addEventListener('close', onModalClosed)
  
  
    let latestDevices = ''
    onOpen(() => modal.showModal())
  
    onUpdate((devices) => {
      if (latestDevices !== JSON.stringify(devices)) {
        latestDevices = JSON.stringify(devices)
        list.devices = devices.map(o => ({
          name: o.deviceName,
          id: o.deviceId
        }))
      }
    })
  }
  