import { Devices } from './devices'
import { Feature } from './feature'
import { Output } from './output'
import { Evaluate } from './evaluation'

export type RegisterFunction = (key: string, info: any) => void
export type Plugin = Output | Evaluate | Feature | Devices
export type Plugins = Record<string, Plugin>
export type PluginType = 'feature' | 'devices' | 'output' | 'evaluation'

export * from './feature'
export * from './evaluation'
export * from './output'
export * from './devices'

const PREFIX = 'neurosys:'
export const SERVICE_PREFIX = `${PREFIX}services:`

// Plugin Managemement Features

export const getTransformedKey = (
    type: string, 
    key: string,
    serviceId?: string // Not browser AND not in the commoners configuration
) => {
    if (serviceId) return `${SERVICE_PREFIX}${serviceId}:${type}:${key}`
    return `${PREFIX}${type}:${key}`
}

export const getEncodedType = (key: string) => {
    
    if (key.startsWith(PREFIX)) {
        const split = key.split(':')
        return split[split.length - 2]
    }

    return null
}

export const getOriginalKey = (key: string) => {

    const split = key.split(':')

    if (key.startsWith(SERVICE_PREFIX)) return `${split[2]}:${split[split.length - 1]}` // Return the original key with the serviceId
    if (key.startsWith(PREFIX)) return split[split.length - 1] // Encoded names for flat list of plugins (e.g. commoners)

    return key
}

export const getPluginType = (encoded: string, plugin: Plugin): PluginType | null => {

    // Handle plugins that have been properly registered
    const encodedType = getEncodedType(encoded)
    if (encodedType) return encodedType as PluginType

    // Handle plugins that have been directly passed based on classes
    if (plugin instanceof Output)  return 'output'
    if (plugin instanceof Evaluate)   return 'evaluation'
    if (plugin instanceof Feature) return 'feature'
    if (plugin instanceof Devices) return 'devices'

    return null
}


const registerPlugins = (plugins: Plugins, type: string) => Object.entries(plugins).reduce((acc, [ key, plugin ]) => ({...acc, [getTransformedKey(type, key)]: plugin}), {})

export const registerFeaturePlugins = (plugins: Plugins) => registerPlugins(plugins, 'feature')
export const registerDevicePlugins = (plugins: Plugins) => registerPlugins(plugins, 'devices')
export const registerOutputPlugins = (plugins: Plugins) => registerPlugins(plugins, 'output')
export const registerEvaluationPlugins = (plugins: Plugins) => registerPlugins(plugins, 'evaluation')
