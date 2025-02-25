import { getPluginType } from '../core/plugins';
import type { Plugin } from '../core/plugins';
import { createServer } from './utils';


export type ServerResponse = {
  success: boolean
  error?: string
}

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
          const [ name, ...rest ] = resolvedPluginName.split('/');
          const methodName = rest.join('/');
          
          const plugin = resolvedPluginInfo[name]; // Plugin ID is the URL without the slash

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