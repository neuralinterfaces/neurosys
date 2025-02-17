import { isPluginInNamespace, NAMESPACES, resolvePlugins } from "./commoners";

export const onToggle = async (fn: Function) => {
    const { menu: { onFeedbackToggle } } = await resolvePlugins()
    onFeedbackToggle(fn)
}

let feedbackOptions: any;
const registerAllFeedbackOptions = async () => {
  const PLUGINS = await resolvePlugins()
  const { menu: { registerFeedback } } = PLUGINS
  return Object.keys(PLUGINS).reduce((acc, key) => {

    if (!isPluginInNamespace(NAMESPACES.feedback, key)) return acc
    
    const plugin = PLUGINS[key]
    const { label, enabled, start, stop, set } = plugin
    registerFeedback(key, { label, enabled })

    acc[key] = { start, stop, set, enabled, __score: null, __info: {} }


    return acc
  }, {})
}

export const getPlugins = async () => feedbackOptions ?? (feedbackOptions = await registerAllFeedbackOptions())


export const set = async (score: number, features: any) => {

    if (score === null && features === null) return // No active score plugin
  
    const feedbackOptions = await getPlugins()

    for (const [ key, plugin ] of Object.entries(feedbackOptions)) {
      plugin.__score = score // Always set score
      plugin.__features = features
      if (plugin.enabled) plugin.set(score, plugin.__info)
    }
}