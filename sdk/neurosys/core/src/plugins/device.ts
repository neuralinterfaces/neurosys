import { ClientInfo, Data, Timestamps } from "./types"

type ProtocolId = string

type ConnectionRequest = {
    data: Data, // Live reference to this client's data
    timestamps: Timestamps, // Live reference to this client's timestamps
    protocol: ProtocolId
}

type ProtocolInformation = string | { label: string, enabled?: false }

type DeviceInformation = {
    name: string
    type: string
    protocols: Record<ProtocolId, ProtocolInformation>
    connect?: (request: ConnectionRequest) => ClientInfo | Promise<ClientInfo>
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
    connect: DeviceInformation['connect']

    constructor(props: DeviceInformation) {
        this.name = props.name
        this.type = props.type
        this.protocols = props.protocols
        this.connect = props.connect
    }
}