import { resolvePlugins } from "./commoners"
import { getOriginalKey, getPluginType } from "./plugins"

export type UserFeatures = {
  bands: string[],
  hegRatio: boolean
}

type FeaturesByChannel<T> = Record<string, T>

type CalculatedFeatures = {
  bands?: FeaturesByChannel<Record<string, number>>
  hegRatio?: number
}


export const registerPlugin = (
  identifier: string, 
  plugin: any, 
  collection: Record<string, any>
) => {

    const { id = getOriginalKey(identifier) } = plugin
    collection[id] = plugin

    return collection

}

let allFeatures: any;
const registerAllFeatures = async () => {

  const PLUGINS = await resolvePlugins()

  return Object.entries(PLUGINS).reduce((acc, [key, plugin = {}]) => {
    const type = getPluginType(key, plugin)
    if (type !== 'feature') return acc
    registerPlugin(key, plugin, acc)
    return acc
  }, {})

}

export const getAllFeatures = async () => allFeatures ?? (allFeatures = registerAllFeatures())

// ------------ Calculate Score ------------
export const calculate = async (
  features: UserFeatures,
  client?: any
): Promise<CalculatedFeatures> => {

  client = client ?? { data: {} }

  const featurePlugins = await getAllFeatures()

  const results = {}
  

  for (const [id, settings] of Object.entries(features)) {
    const plugin = featurePlugins[id]
    if (!plugin) continue

    const { duration, calculate } = plugin
    if (!calculate) continue

    // Pre-window the data if necessary
    let data = client.data
    if (duration != undefined) {
        const { sfreq } = client
        const window = [ -sfreq * duration ]
        data = Object.entries(data).reduce((acc, [ch, chData]) => {
          acc[ch] = chData.slice(...window)
          return acc
        }, {})
    }

    results[id] = await plugin.calculate({ ...client, data }, settings) // NOTE: Support multiple requesteres in the future
  }

  return results

}
