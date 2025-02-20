import { MenuLabel, Score } from "./types"


type Refs = any

type OutputProps = {
    label: MenuLabel,
    start?: () => Refs,
    set: (score: Score, refs: Refs) => void,
    stop?: (refs: Refs) => void
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