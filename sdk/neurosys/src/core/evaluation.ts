import { resolvePlugins } from "./commoners"
import type { RegisterFunction, Evaluate } from "./plugins"

export const onToggle = async (fn: Function) => {
  const { menu: { onEvaluationToggle } } = await resolvePlugins()
  onEvaluationToggle(fn)
}

export type EvaluationInfo = {
  label: string,
  enabled: boolean,
  get: Evaluate['get'],
  features: Evaluate['features'],
  __ctx: Record<string, any>
}

export const registerPlugin = (
  plugin: Evaluate, 
) => {
    
    const { 
      label,    // Menu Information
      enabled,  // Menu state
      get,      // Evaluation getter
      features  // Features requested
    } = plugin

    return { label, enabled, get, features, __ctx: {} }

}

export const getActivePlugin = async (collection) => Object.values(collection).find(({ enabled }) => enabled) 

export const calculate = async (plugin: any, calculatedFeatures: any) => {
    const { get, __ctx } = plugin
    return get.call(__ctx, calculatedFeatures)
  }
  
  