import type { Plugin, Plugins } from "../plugins";
import * as pluginUtils from '../plugins'

const getCommonersPlugin = (plugin: Plugin) => {

    const { desktop } = plugin
    
    return {
        load: function () {
            plugin.__commoners = this // Allow attaching the Commmoners context to the plugin
            return plugin
        },
        desktop
    }
}

const mapPluginsForCommoners = (plugins: Plugins) => Object.entries(plugins).reduce((acc, [key, plugin]) => ({ ...acc, [key]: getCommonersPlugin(plugin) }), {})

export const registerFeaturePlugins = (plugins: Plugins) => pluginUtils.registerFeaturePlugins(mapPluginsForCommoners(plugins))
export const registerDevicePlugins = (plugins: Plugins) => pluginUtils.registerDevicePlugins(mapPluginsForCommoners(plugins))
export const registerOutputPlugins = (plugins: Plugins) => pluginUtils.registerOutputPlugins(mapPluginsForCommoners(plugins))
export const registerEvaluationPlugins = (plugins: Plugins) => pluginUtils.registerEvaluationPlugins(mapPluginsForCommoners(plugins))
