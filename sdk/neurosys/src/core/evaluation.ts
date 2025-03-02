import { Evaluate } from "./plugins"

export type EnhancedEvaluatePlugin = Evaluate & {
  enabled: boolean
  __ctx: Record<string, any>
}

export const registerPlugin = (
  plugin: Evaluate, 
) => {

    const copy = new Evaluate(plugin) as EnhancedEvaluatePlugin
    copy.__ctx = {}


    return copy

}

export const calculate = async (plugin: any, calculatedFeatures: any) => {
    const { get, __ctx } = plugin
    return get.call(__ctx, calculatedFeatures)
  }
  
  