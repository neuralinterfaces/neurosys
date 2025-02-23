import { getTransformedKey, getPluginType, NAMESPACES } from '../core/plugins';
import type { Plugin, Plugins } from '../core/plugins';
import { createServer } from './utils';


export type ServerResponse = {
  success: boolean
  error?: string
}

export * from '../core/plugins/feature'
export * from '../core/plugins/score'
export * from  '../core/plugins/output'
export * from  '../core/plugins/devices'

// Use special handlers for service plugins
const registerPlugins = (plugins: Plugins, namespace: string) => Object.entries(plugins).reduce((acc, [ key, plugin ]) => ({...acc, [getTransformedKey(namespace, key, true)]: plugin}), {})
export const registerFeaturePlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.features)
export const registerDevicePlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.devices)
export const registerOutputPlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.outputs)
export const registerScorePlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.scores)

export const createService = (plugins: Record<string, Plugin> = {}) => {

    const resolvedPluginInfo = Object.entries(plugins).reduce((acc, [ id, plugin ]) => {
        const type = getPluginType(id, plugin)
        if (type === undefined) return acc
        acc[id] = { info: plugin, type }
        return acc
    }, {})

    return createServer({
      async post(url, ...args) {
        
          const resolvedPluginName = url.slice(1); // Plugin ID is the URL without the slash
          const [ namespace, name, ...rest ] = resolvedPluginName.split('/');
          const methodName = rest.join('/');

          const pluginName = getTransformedKey(namespace, name, true);
          
          const plugin = resolvedPluginInfo[pluginName]; // Plugin ID is the URL without the slash

          if (!plugin) return { success: false, error: 'Plugin not found' };

          try {
            const resolved = plugin.info as Plugin
            const method = resolved[methodName];
            if (!method) return { success: false, error: 'Method not found' };
            const result = await method.call(this, ...args); // NOTE: No refs from the start method for now
            return { success: true, result };
          } catch (error) {
            return { success: false, error: error.message };
          }
      },
      get: async () => resolvedPluginInfo

    })

}