import { getPluginType } from '../core/plugins';
import type { Plugin } from '../core/plugins';
import { NEUROSYS_SUBROUTE } from './globals';
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

        if (!url.startsWith(NEUROSYS_SUBROUTE)) return { code: 404, success: false, error: 'Not Found' }

          const resolvedPluginName = url.slice(1); // Plugin ID is the URL without the slash
          const [ prefix, name, ...rest ] = resolvedPluginName.split('/');
          
          const plugin = resolvedPluginInfo[name]; // Plugin ID is the URL without the slash
          if (!plugin) return { success: false, error: 'Plugin not found' };

          const { type } = plugin || {}
          const isDevices = type === 'devices'
          const methodName = (isDevices ? rest.slice(1) : rest).join('/')

          try {
            const resolved = isDevices ? plugin.info.devices[rest[0]] : plugin.info 
            const method = resolved[methodName];
            if (!method) return { success: false, error: 'Method not found' };

            if (isDevices && methodName === 'connect') {

              const [ info ] = args

              let subscriber: any;

              // Pass through to a EventSoure on the browser
              const notify = (...args) => {
                if (!subscriber) return
                subscriber(args)
              }

              const result = await method.call(this, info, notify); // NOTE: No refs from the start method for now
              return { 
                success: true, 
                result, 
                subscribe: (callback: Function) => subscriber = callback
              }

            } else {
              const result = await method.call(this, ...args); // NOTE: No refs from the start method for now
              return { success: true, result };
            }

          } catch (error) {
            return { success: false, error: error.message };
          }
      },
      get: async (url) => {
        if (!url.startsWith(NEUROSYS_SUBROUTE)) return { code: 404, success: false, error: 'Not Found' }
        return { success: true, result: resolvedPluginInfo }
      }

    })

}