import { MenuLabel, Score } from "./types"


type StartRefs = any
type StopRefs = any

type OutputProps = {
    label: MenuLabel,
    start?: (refs: StopRefs) => StartRefs,
    set: (score: Score, refs: StartRefs) => void,
    stop?: (refs: StartRefs) => StopRefs
}

export class Output {

    label: OutputProps['label']
    start: OutputProps['start']
    stop: OutputProps['stop']
    set: OutputProps['set']

    constructor(props: OutputProps) {
        this.label = props.label
        this.start = props.start
        this.stop = props.stop
        this.set = props.set
    }
}