import { Plugins } from "./types"

export const resolvePlugins = async () => await commoners.READY

export const NAMESPACES = {
    features: 'feature',
    devices: 'device',
    outputs: 'outputs',
    scores: 'score'
}

export const getTransformedKey = (namespace: string, key: string) => `neurosys:${namespace}:${key}`
export const getOriginalKey = (namespace: string, key: string) => key.replace(`neurosys:${namespace}:`, '')
export const isPluginInNamespace = (namespace: string, key: string) => key.startsWith(`neurosys:${namespace}:`)

export const registerPlugins = (plugins: Plugins, namespace: string) => {
    return Object.entries(plugins).reduce((acc, [ key, plugin ]) => {
        key = getTransformedKey(namespace, key)
        acc[key] = plugin
        return acc
    }, {})
}