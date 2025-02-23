import { Device } from './device'
import { Feature } from './feature'
import { Output } from './output'
import { Score } from './score'

export type RegisterFunction = (key: string, info: any) => void
export type Plugin = Output | Score | Feature | Device
export type Plugins = Record<string, Plugin>
export type PluginType = 'feature' | 'device' | 'output' | 'score'

export * from './feature'
export * from './score'
export * from './output'
export * from './device'

const PREFIX = 'neurosys:'

// Plugin Managemement Features
export const NAMESPACES = {
    features: 'feature',
    devices: 'device',
    outputs: 'outputs',
    scores: 'score'
}

export const getTypeFromNamespace = (namespace: string) => {
    switch (namespace) {
        case NAMESPACES.features: return 'feature'
        case NAMESPACES.devices: return 'device'
        case NAMESPACES.outputs: return 'output'
        case NAMESPACES.scores: return 'score'
        default: return null
    }
}

export const getTransformedKey = (
    namespace: string, 
    key: string,
    isService: boolean = !globalThis.window
) => {
    if (isService) return `${PREFIX}${namespace}:service:${key}`
    return `${PREFIX}${namespace}:${key}`
}

export const getNamespace = (key: string) => {
    
    if (key.startsWith(PREFIX)) {
        const split = key.split(':')
        return split[1]
    }

    return null
}

export const getOriginalKey = (key: string) => {

    if (key.startsWith(PREFIX)) {
        const split = key.split(':')
        return split[split.length - 1]
    }

    return key
}

export const getPluginType = (encoded: string, plugin: Plugin): PluginType | null => {

    // Handle plugins that have been properly registered
    const namespace = getNamespace(encoded)
    if (namespace) return getTypeFromNamespace(namespace)

    // Handle plugins that have been directly passed based on classes
    if (plugin instanceof Output)  return 'output'
    if (plugin instanceof Score)   return 'score'
    if (plugin instanceof Feature) return 'feature'
    if (plugin instanceof Device)  return 'device'
    return null
}


export const registerPlugins = (plugins: Plugins, namespace: string) => {
    return Object.entries(plugins).reduce((acc, [ key, plugin ]) => {
        key = getTransformedKey(namespace, key)
        acc[key] = plugin
        return acc
    }, {})
}

export const registerFeaturePlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.features)
export const registerDevicePlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.devices)
export const registerOutputPlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.outputs)
export const registerScorePlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.scores)
