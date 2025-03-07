import type { ClientDataStructure, Montage, NotifyCallback } from "./types"

type ProtocolId = string

type ConnectionRequest = {
    protocol: ProtocolId
}

type ProtocolInformation = string | { label: string, enabled?: false }

export type DeviceInformation = {
    name: string
    protocols: Record<ProtocolId, ProtocolInformation>
    // montage: Montage // Montage getter
    connect?: (this: Device, request: ConnectionRequest, notify: NotifyCallback) => ClientDataStructure | Promise<ClientDataStructure>
    disconnect?: (this: Device) => void
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
    protocols: DeviceInformation['protocols']
    // montage: DeviceInformation['montage']
    connect: DeviceInformation['connect']
    disconnect: DeviceInformation['disconnect']

    constructor(props: DeviceInformation) {
        this.name = props.name
        this.protocols = props.protocols
        // this.montage = props.montage
        this.connect = props.connect
        this.disconnect = props.disconnect
    }
}