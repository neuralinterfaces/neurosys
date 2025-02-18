import { getOriginalKey, isPluginInNamespace, NAMESPACES, resolvePlugins } from "./commoners"

export type UserFeatures = {
    bands: string[],
    hegRatio: boolean
}
  
  type FeaturesByChannel<T> = Record<string, T>
  
  type CalculatedFeatures = {
    bands?: FeaturesByChannel<Record<string, number>>
    hegRatio?: number
  }


  let allFeatures: any;
  const registerAllFeatures = async () => {

    const PLUGINS = await resolvePlugins()
  
    return Object.entries(PLUGINS).reduce((acc, [ key, plugin = {} ]) => {
      if (!isPluginInNamespace(NAMESPACES.features, key)) return acc
      const { id = getOriginalKey(NAMESPACES.features, key) } = plugin
      acc[id] = plugin
      return acc
    }, {})

  }

  const getAllFeatures = async () => allFeatures ?? (allFeatures = await registerAllFeatures())

// ------------ Calculate Score ------------
export const calculate = async (
    features: UserFeatures, 
    client?: any
  ): Promise<CalculatedFeatures> => {

    client = client ?? { data: {} }
  
    const featurePlugins = await getAllFeatures()
  
    const results = {}
  
    for (const [ id, settings ] of Object.entries(features)) {
      const plugin = featurePlugins[id]
      if (!plugin) continue
      if (!plugin.calculate) continue

      results[id] = await plugin.calculate(client, settings) // NOTE: Support multiple requesteres in the future
    }

  
    return results
  
  }
