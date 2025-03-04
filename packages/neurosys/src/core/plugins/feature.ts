
import { FeatureId, DeviceFilter, Settings, Data } from "./types"

type FeatureInputs = {
    data: Data,
    sfreq: number,
}

type FeatureProps = {
    id: FeatureId,
    devices?: DeviceFilter
    duration?: number
    calculate: (inputs: FeatureInputs, settings: Settings) => any
}

export class Feature {

    id: FeatureProps['id']
    devices: DeviceFilter
    duration: FeatureProps['duration'] // Window duration regardless of sampling frequency
    calculate: FeatureProps['calculate']

    constructor(props: FeatureProps) {
        this.id = props.id
        this.devices = props.devices || []
        this.calculate = props.calculate
        this.duration = props.duration
    }
}