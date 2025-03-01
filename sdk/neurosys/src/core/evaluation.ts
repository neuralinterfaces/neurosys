import { resolvePlugins } from "./commoners"
import type { RegisterFunction, Evaluate } from "./plugins"

export const onToggle = async (fn: Function) => {
  const { menu: { onEvaluationToggle } } = await resolvePlugins()
  onEvaluationToggle(fn)
}

type EvaluationInfo = {
  enabled: boolean,
  get: Evaluate['get'],
  features: Evaluate['features'],
  __ctx: Record<string, any>
}

const evaluationOptions: Record<string, EvaluationInfo> = {}

export const registerPlugin = async (
  identifier: string, 
  plugin: Evaluate, 
  register?: RegisterFunction
) => {
    
  if (evaluationOptions[identifier]) return console.error('Evaluation plugin is already registered', identifier, plugin)

    if (!register) {
      const PLUGINS = await resolvePlugins()
      const { menu: { registerEvaluation } } = PLUGINS
      register = registerEvaluation
    }

    const resolvedRegisterFn = register as RegisterFunction

    const { 
      label,    // Menu Information
      enabled,  // Menu state
      get,      // Evaluation getter
      features  // Features requested
    } = plugin

    evaluationOptions[identifier] = { enabled, get, features, __ctx: {} }
    resolvedRegisterFn(identifier, { label, enabled })

}

export const getPlugin = (key: string) => evaluationOptions[key]

export const togglePlugin = (key: string, state?: boolean) => {
  const plugin = getPlugin(key)
  return plugin.enabled = typeof state === 'boolean' ? state : !plugin.enabled
}

export const getActivePlugin = async () => {
    return Object.values(evaluationOptions).find(({ enabled }) => enabled) 
}
  
export const calculate = async (plugin: any, calculatedFeatures: any) => {
    const { get, __ctx } = plugin
    return get.call(__ctx, calculatedFeatures)
  }
  
  