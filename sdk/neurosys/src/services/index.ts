import { Output, Score, Feature, Device, getTransformedKey, getNamespace, getTypeFromNamespace } from '../core/plugins';
import { createServer } from './utils';

export type ServerResponse = {
    success: boolean
    error?: string
}

type Plugin = Output | Score | Feature | Device

const getPluginType = (encoded: string, plugin: Plugin) => {

    // Handle plugins that have been properly registered
    const namespace = getNamespace(encoded)
    if (namespace) return getTypeFromNamespace(namespace)

    // Handle plugins that have been directly passed based on classes
    if (plugin instanceof Output)  return 'output'
    if (plugin instanceof Score)   return 'score'
    if (plugin instanceof Feature) return 'feature'
    if (plugin instanceof Device)  return 'device'
}

export const createService = (plugins: Record<string, Plugin> = {}) => {

    const resolvedPluginInfo = Object.entries(plugins).reduce((acc, [ id, plugin ]) => {
        const type = getPluginType(id, plugin)
        if (type === undefined) return acc
        acc[id] = { info: plugin, type }
        return acc
    }, {})

    return createServer({
      post: async (url, ...args) => {

          const resolvedPluginName = url.slice(1); // Plugin ID is the URL without the slash
          const [ namespace, name, ...rest ] = resolvedPluginName.split('/');
          const methodName = rest.join('/');

          const pluginName = getTransformedKey(namespace, name, true);
          
          const plugin = resolvedPluginInfo[pluginName]; // Plugin ID is the URL without the slash
          if (!plugin) return { success: false, error: 'Plugin not found' };

          try {
            const resolved = plugin.info as Output
            const method = resolved[methodName];
            if (!method) return { success: false, error: 'Method not found' };
            const result = await method(...args); // NOTE: No refs from the start method for now
            return { success: true, result };
          } catch (error) {
            return { success: false, error: error.message };
          }
      },
      get: async () => resolvedPluginInfo

    })

}