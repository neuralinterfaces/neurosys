import { Score } from "../score"
import { MenuLabel } from "./types"

type SettingsSchema = Record<string, any>
type ResolvedSettings = Record<string, any>

export type Context = {
    settings: ResolvedSettings,
    commoners?: Record<string, any>, // Commoners utilities
  }

type Features = {

    // Default values provided by Neurosys
    score: number,
    __score: Score,

    // Evaluation-requested features
    [key: string]: any
}

type OutputProps = {
    label: MenuLabel,
    settings?: SettingsSchema,
    start?: (this: Context) => void,
    set: ( this: Context, features: Features, resolvedSettings: ResolvedSettings ) => void,
    stop?: (this: Context) => void
}

export class Output {

    label: OutputProps['label']
    settings: SettingsSchema

    start: OutputProps['start']
    stop: OutputProps['stop']

    set: OutputProps['set']

    constructor(props: OutputProps) {

        this.label = props.label

        this.start = props.start
        this.stop = props.stop
        this.set = props.set
        this.settings = props.settings ?? {}
    }
}