export type Montage = string[]
export type Data = Record<Montage[number], number[]>
export type Timestamps = number[]

type DataUpdate = { data: Data, timestamps: Timestamps }

export type NotifyCallback = (update: DataUpdate, collection: string) => void // Use group to keep timestamps distinct

type DataStreamProps = { sfreq: number }

type CollectionKey = string
export type ClientDataStructure = Record<CollectionKey, DataStreamProps> |  DataStreamProps

export class DataStream {

    data: Data = {}
    timestamps: Timestamps = []
    sfreq: DataStreamProps["sfreq"] = 0

    constructor({ sfreq }: DataStreamProps) {
        this.data = {}
        this.timestamps = []
        this.sfreq = sfreq
    }

    update(update: { data: Data, timestamps: Timestamps }) {
        const { data: dataUpdate, timestamps: timestampsUpdate } = update
        for (const channel in dataUpdate) {
            if (!this.data[channel]) this.data[channel] = []
            this.data[channel].push(...dataUpdate[channel])
        }
        this.timestamps.push(...timestampsUpdate)
    }
}


export type FeatureId = string
export type DeviceFilter = string[]

export type Settings = any

export type MenuLabel = string

export type ResolvedFeature = any

export type Score = number