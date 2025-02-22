import { Output, Score, Feature, Device } from '../core/plugins';
import { createServer } from './utils';

export type ServerResponse = {
    success: boolean
    error?: string
}

type Plugin = Output | Score | Feature | Device

const getPluginType = (plugin: Plugin) => {
    if (plugin instanceof Output)  return 'output'
    if (plugin instanceof Score)   return 'score'
    if (plugin instanceof Feature) return 'feature'
    if (plugin instanceof Device)  return 'device'
}

export const createService = (plugins: Record<string, Plugin> = {}) => {

    const resolvedPluginInfo = Object.entries(plugins).reduce((acc, [ id, plugin ]) => {
        const type = getPluginType(plugin)
        if (type === undefined) return acc
        acc[id] = { info: plugin, type }
        return acc
    }, {})

    return createServer({
      post: async (url, json) => {

          const plugin = resolvedPluginInfo[url.slice(1)]; // Plugin ID is the URL without the slash

          if (!plugin) return { success: false, error: 'Plugin not found' };

          try {
              if (plugin.type === 'output') {
                  const { set } = plugin.info as Output
                  const result = set(json.score, {}); // NOTE: No refs from the start method for now
                  return { success: true, result };
              }
              
              else return { success: false, error: 'Plugin not aviailable' };
              // await handler(features);
          } catch (error) {
            return { success: false, error: error.message };
          }
      },
      get: async () => resolvedPluginInfo

    })

}