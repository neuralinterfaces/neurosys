import { Client } from "./client"
import { Feature } from "./plugins"

type FeatureSettings = any
export type FeatureCollection = Record<string, Feature>

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