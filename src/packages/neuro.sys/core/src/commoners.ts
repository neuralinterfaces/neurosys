

export const resolvePlugins = async () => await commoners.READY

type Plugins = Record<string, any>

export const NAMESPACES = {
    features: 'feature',
    devices: 'device',
    feedback: 'feedback',
    scores: 'score'
}

export const getTransformedKey = (namespace: string, key: string) => `neurosys:${namespace}:${key}`
export const getOriginalKey = (namespace: string, key: string) => key.replace(`neurosys:${namespace}:`, '')
export const isPluginInNamespace = (namespace: string, key: string) => key.startsWith(`neurosys:${namespace}:`)

const registerPlugins = (plugins: Plugins, namespace: string) => {
    return Object.entries(plugins).reduce((acc, [ key, plugin ]) => {
        key = getTransformedKey(namespace, key)
        acc[key] = plugin
        return acc
    }, {})
}


export const registerFeaturePlugins = (plugins: Plugins) =>registerPlugins(plugins, NAMESPACES.features)
export const registerDevicePlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.devices)
export const registerFeedbackPlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.feedback)
export const registerScorePlugins = (plugins: Plugins) => registerPlugins(plugins, NAMESPACES.scores)
