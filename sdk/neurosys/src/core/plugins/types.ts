export type Data = Record<string, number[]>
export type Timestamps = number[]

export type ClientInfo = {
    sfreq: number
    disconnect: () => void
}

export type Client = ClientInfo & {
    data: Data,
    timestamps: Timestamps
}

export type FeatureId = string
export type DeviceFilter = string[]

export type Settings = any

export type MenuLabel = string

export type ResolvedFeature = any

export type Score = number