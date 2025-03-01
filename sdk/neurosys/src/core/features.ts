import { Client } from "./client"
import { Feature, getOriginalKey } from "./plugins"

type FeatureSettings = any
type SettingsForFeatures = Record<string, FeatureSettings> 
export type FeatureCollection = Record<string, Feature>

const featureOptions: Record<string, Feature> = {}

export const registerPlugin = (
  identifier: string, 
  plugin: Feature
) => {
    const { id = getOriginalKey(identifier) } = plugin
    if (featureOptions[id]) return console.error('Feature plugin is already registered', id, plugin)
    featureOptions[id] = plugin
}


export const calculate = (
  plugin: Feature,
  settings: FeatureSettings,
  client: Client
): any | Promise<any> => {
  
  const { duration } = plugin

  // for (const cId in client.streams) {
    // const collection = client.streams[cId]

    const stream = Object.values(client.streams)[0] // Only calculate for the first collection

    // Pre-window the data if necessary
    let data = stream.data
    if (Object.keys(data).length === 0) return {} // No data = No features

    if (duration != undefined) {
        const { sfreq } = stream
        const window = [ -sfreq * duration ]
        data = Object.entries(data).reduce((acc, [ch, chData]) => {
          acc[ch] = chData.slice(...window)
          return acc
        }, {})
    }

    return plugin.calculate({ data, sfreq: stream.sfreq }, settings) // NOTE: Support multiple requesters in the future
}

export const getAllPlugins = () => ({ ...featureOptions })
export const getPlugins = (features: SettingsForFeatures = {}) => Object.keys(features).reduce((acc, id) => featureOptions[id] ? { ...acc, [id]: featureOptions[id] } : acc, {}) as FeatureCollection