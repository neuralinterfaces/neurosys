import { ClientDataStructure, Montage, NotifyCallback } from "./types"

export { DataCollection } from './types'

type ProtocolId = string

type ConnectionRequest = {
    protocol: ProtocolId
}

type ProtocolInformation = string | { label: string, enabled?: false }

type DeviceInformation = {
    name: string
    type?: string
    protocols: Record<ProtocolId, ProtocolInformation>
    // montage: Montage // Montage getter
    connect: (this: Device, request: ConnectionRequest, notify: NotifyCallback) => ClientDataStructure | Promise<ClientDataStructure>
    disconnect: (this: Device) => void
}

type DeviceProps = {
    devices: DeviceInformation[]
}

export class Devices {

    devices: DeviceProps['devices']

    constructor(devices: DeviceInformation[] = []) {
        this.devices = devices.map(device => device instanceof Device ? device : new Device(device))
    }
}

export class Device {
    
    name: DeviceInformation['name']
    type: DeviceInformation['type']
    protocols: DeviceInformation['protocols']
    // montage: DeviceInformation['montage']
    connect: DeviceInformation['connect']
    disconnect: DeviceInformation['disconnect']

    constructor(props: DeviceInformation) {
        this.name = props.name
        this.type = props.type
        this.protocols = props.protocols
        // this.montage = props.montage
        this.connect = props.connect
        this.disconnect = props.disconnect
    }
}