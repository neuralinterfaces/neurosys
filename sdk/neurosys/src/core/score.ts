import { resolvePlugins } from "./commoners"
import { getPluginType } from "./plugins"
import type { RegisterFunction } from "./plugins"

export const onToggle = async (fn: Function) => {
  const { menu: { onScoreToggle } } = await resolvePlugins()
  onScoreToggle(fn)
}

export const registerPlugin = async (
  identifier: string, 
  plugin: any, 
  collection: Record<string, any>,
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

    collection[identifier] = { enabled, get, features, __ctx: {} }
    resolvedRegisterFn(identifier, { label, enabled })
    return collection
}

const registerAllScores = async () => {
  
  const PLUGINS = await resolvePlugins()

  const { menu: { registerScore } } = PLUGINS

  return Object.entries(PLUGINS).reduce((acc, [ key, plugin ]) => {

    const type = getPluginType(key, plugin)
    if (type !== 'score') return acc
    registerPlugin(key, plugin, acc, registerScore)
    return acc
  }, {})
}

let allScores: any;
export const getPlugins = async () => allScores ?? (allScores = registerAllScores())

export const getActivePlugin = async () => {
    const scoreOptions = await getPlugins()
    return Object.values(scoreOptions).find(({ enabled }) => enabled)
}
  
export const calculate = async (calculatedFeatures: any) => {
    const plugin = await getActivePlugin()
    if (!plugin) return { features: null, score: null }
    const { get, __ctx } = plugin
    return get.call(__ctx, calculatedFeatures)
  }
  
  