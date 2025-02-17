import { resolvePlugins } from "./commoners"
import { DataRange } from "./types"

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
      const { feature } = plugin
      if (!feature) return acc
      acc[key] = plugin
      return acc
    }, {})

  }

  const getAllFeatures = async () => allFeatures ?? (allFeatures = await registerAllFeatures())

// ------------ Calculate Score ------------
export const calculate = async (
    features: UserFeatures, 
    dataRange: DataRange,
    client?: any
  ): Promise<CalculatedFeatures> => {

    const { data = {}, sfreq } = client ?? {}
  
    const featurePlugins = await getAllFeatures()
  
    const results = {}
  
    for (const [ key, value ] of Object.entries(features)) {
      const plugin = featurePlugins[key]
      if (!plugin) continue
      const { calculate } = plugin
      if (!calculate) continue
      results[key] = await calculate({ data, window: dataRange, sfreq }, [ value ]) // NOTE: Support multiple requesteres in the future
    }

  
    return results
  
  }
