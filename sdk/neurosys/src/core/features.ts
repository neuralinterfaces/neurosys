import { getOriginalKey } from "./plugins"

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
    featureOptions[id] = plugin
}

// ------------ Calculate Score ------------
export const calculate = async (
  features: UserFeatures,
  client?: any
): Promise<CalculatedFeatures> => {

  client = client ?? { data: {} }

  const results = {}
  

  for (const [id, settings] of Object.entries(features)) {
    const plugin = featureOptions[id]
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
