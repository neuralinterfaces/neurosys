export type Plugins = Record<string, any>

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

export const isPluginInNamespace = (namespace: string, key: string) => key.startsWith(`${PREFIX}${namespace}:`)

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
