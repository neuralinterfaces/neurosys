
import { FeatureId, DeviceFilter, Client, Settings } from "./types"

type FeatureProps = {
    id: FeatureId,
    devices?: DeviceFilter
    calculate: (client: Client, settings: Settings) => any
}

export class Feature {

    id: FeatureProps['id']
    devices: DeviceFilter
    calculate: FeatureProps['calculate']

    constructor(props: FeatureProps) {
        this.id = props.id
        this.devices = props.devices || []
        this.calculate = props.calculate
    }
}