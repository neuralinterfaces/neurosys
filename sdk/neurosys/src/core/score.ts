import { resolvePlugins } from "./commoners"
import type { RegisterFunction } from "./plugins"

export const onToggle = async (fn: Function) => {
  const { menu: { onScoreToggle } } = await resolvePlugins()
  onScoreToggle(fn)
}

const scoreOptions: Record<string, any> = {}

export const registerPlugin = async (
  identifier: string, 
  plugin: any, 
  register?: RegisterFunction
) => {
    
    if (!register) {
      const PLUGINS = await resolvePlugins()
      const { menu: { registerScore } } = PLUGINS
      register = registerScore
    }

    const resolvedRegisterFn = register as RegisterFunction

    const { 
      label,    // Menu Information
      enabled,  // Menu state
      get,      // Score getter
      features  // Features requested
    } = plugin

    scoreOptions[identifier] = { enabled, get, features, __ctx: {} }
    resolvedRegisterFn(identifier, { label, enabled })

}

export const getPlugin = (key: string) => scoreOptions[key]

export const togglePlugin = (key: string, state?: boolean) => {
  const plugin = getPlugin(key)
  return plugin.enabled = typeof state === 'boolean' ? state : !plugin.enabled
}

export const getActivePlugin = async () => {
    return Object.values(scoreOptions).find(({ enabled }) => enabled)
}
  
export const calculate = async (calculatedFeatures: any) => {
    const plugin = await getActivePlugin()
    if (!plugin) return { features: null, score: null }
    const { get, __ctx } = plugin
    return get.call(__ctx, calculatedFeatures)
  }
  
  