import { Plugins } from "./types"
import { NAMESPACES, registerPlugins } from "./utils"

export const registerFeaturePlugins = (plugins: Plugins) =>registerPlugins(plugins, NAMESPACES.features)
export const registerDevicePlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.devices)
export const registerOutputPlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.outputs)
export const registerScorePlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.scores)
