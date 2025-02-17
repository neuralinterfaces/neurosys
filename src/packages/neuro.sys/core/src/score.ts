import { isPluginInNamespace, NAMESPACES, resolvePlugins } from "./commoners"

export const onToggle = async (fn: Function) => {
  const { menu: { onScoreToggle } } = await resolvePlugins()
  onScoreToggle(fn)
}

const registerAllScores = async () => {
  
  const PLUGINS = await resolvePlugins()

  const { menu: { registerScore } } = PLUGINS

  return Object.keys(PLUGINS).reduce((acc, key) => {

    if (!isPluginInNamespace(NAMESPACES.scores, key)) return acc
    
    const plugin = PLUGINS[key]

    const { 
      label,    // Menu Information
      enabled,  // Menu state
      get,      // Score getter
      features  // Features requested
    } = plugin

    registerScore(key, { label, enabled })

    acc[key] = { enabled, get, features, __ctx: {} }
    return acc
  }, {})
}

let allScores: any;
export const getPlugins = async () => allScores ?? (allScores = await registerAllScores())

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
  
  