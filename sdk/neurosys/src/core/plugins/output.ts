import { Norm } from "../norms"
import { MenuLabel } from "./types"


type StartRefs = any
type StopRefs = any

type Settings = Record<string, any>
type Features = {

    // Default values provided by Neurosys
    score: number,
    __score: Norm,

    // Score-requested features
    [key: string]: any
}

type OutputProps = {
    label: MenuLabel,
    settings?:Settings,
    start?: (refs: StopRefs) => StartRefs,
    set: (features: Features, refs: StartRefs) => void,
    stop?: (refs: StartRefs) => StopRefs
}

export class Output {

    label: OutputProps['label']
    settings: Settings
    start: OutputProps['start']
    stop: OutputProps['stop']
    set: OutputProps['set']

    constructor(props: OutputProps) {
        this.label = props.label
        this.settings = props.settings || {}
        this.start = props.start
        this.stop = props.stop
        this.set = props.set
    }
}