import { resolvePlugins } from "./commoners"

export const onToggle = async (fn: Function) => {
  const { menu: { onScoreToggle } } = await resolvePlugins()
  onScoreToggle(fn)
}

const registerAllScores = async () => {
  
  const PLUGINS = await resolvePlugins()

  const { menu: { registerScore } } = PLUGINS

  return Object.entries(PLUGINS).reduce((acc, [ key, plugin = {} ]) => {
    const { 
      score,    // Menu Information
      enabled,  // Menu state
      get,      // Score getter
      features  // Features requested
    } = plugin

    if (!score) return acc

    registerScore(key, { score, enabled, })

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
  
  