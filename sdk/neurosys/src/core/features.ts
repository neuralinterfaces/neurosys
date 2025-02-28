import feature from "../../../../app/examples/plugins/feature"
import { Feature, getOriginalKey } from "./plugins"
import { Client } from "./plugins/types"

type FeatureSettings = any
type SettingsForFeatures = Record<string, FeatureSettings> 
type FeatureCollection = Record<string, FeatureSettings>

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

  const collections = client.data
  // for (const cId in collections) {
    // const collection = collections[cId]
    const collection = collections['default'] // Only calculate for default collection

    // Pre-window the data if necessary
    let data = collection.data
    if (Object.keys(data).length === 0) return {} // No data = No features

    if (duration != undefined) {
        const { sfreq } = collection
        const window = [ -sfreq * duration ]
        data = Object.entries(data).reduce((acc, [ch, chData]) => {
          acc[ch] = chData.slice(...window)
          return acc
        }, {})
    }

    return plugin.calculate({ data, sfreq: collection.sfreq }, settings) // NOTE: Support multiple requesters in the future
}

export const getPlugins = (features: SettingsForFeatures = {}) => Object.keys(features).reduce((acc, id) => featureOptions[id] ? { ...acc, [id]: featureOptions[id] } : acc, {}) as FeatureCollection