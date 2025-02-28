import { resolvePlugins } from "./commoners"
import type { RegisterFunction, Score } from "./plugins"

export const onToggle = async (fn: Function) => {
  const { menu: { onScoreToggle } } = await resolvePlugins()
  onScoreToggle(fn)
}

type ScoreInfo = {
  enabled: boolean,
  get: Score['get'],
  features: Score['features'],
  __ctx: Record<string, any>
}

const scoreOptions: Record<string, ScoreInfo> = {}

export const registerPlugin = async (
  identifier: string, 
  plugin: Score, 
  register?: RegisterFunction
) => {
    
  if (scoreOptions[identifier]) return console.error('Score plugin is already registered', identifier, plugin)

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
  
export const calculate = async (plugin: any, calculatedFeatures: any) => {
    const { get, __ctx } = plugin
    return get.call(__ctx, calculatedFeatures)
  }
  
  