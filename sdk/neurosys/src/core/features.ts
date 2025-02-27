import { getOriginalKey } from "./plugins"
import { Client } from "./plugins/types"

export type UserFeatures = {
  bands: string[],
  hegRatio: boolean
}

type FeaturesByChannel<T> = Record<string, T>

type CalculatedFeatures = {
  bands?: FeaturesByChannel<Record<string, number>>
  hegRatio?: number
}

const featureOptions: Record<string, any> = {}


export const registerPlugin = (
  identifier: string, 
  plugin: any
) => {
    const { id = getOriginalKey(identifier) } = plugin
    if (featureOptions[id]) return console.error('Feature plugin is already registered', id, plugin)
    featureOptions[id] = plugin
}

// ------------ Calculate Score ------------
export const calculate = async (
  features: UserFeatures,
  client?: Client
): Promise<CalculatedFeatures> => {

  if (!client) return {} // No default behavior 

  const results = {}
  

  for (const [id, settings] of Object.entries(features)) {
    const plugin = featureOptions[id]
    if (!plugin) {
      console.warn('Feature plugin not found', id)
      continue
    }

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

      const result = await plugin.calculate({ data, sfreq: collection.sfreq }, settings) // NOTE: Support multiple requesters in the future
      results[id] = result
    // }
  }

  return results

}
