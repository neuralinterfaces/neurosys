import { isPluginInNamespace, NAMESPACES, resolvePlugins } from "./commoners";

export const onToggle = async (fn: Function) => {
    const { menu: { onOutputToggle } } = await resolvePlugins()
    onOutputToggle(fn)
}

let outputOptions: any;
const registerAllOutputOptions = async () => {
  const PLUGINS = await resolvePlugins()
  const { menu: { registerOutput } } = PLUGINS
  return Object.keys(PLUGINS).reduce((acc, key) => {

    if (!isPluginInNamespace(NAMESPACES.outputs, key)) return acc
    
    const plugin = PLUGINS[key]
    const { label, enabled, start, stop, set } = plugin
    registerOutput(key, { label, enabled })

    acc[key] = { start, stop, set, enabled, __score: null, __info: {} }


    return acc
  }, {})
}

export const getPlugins = async () => outputOptions ?? (outputOptions = await registerAllOutputOptions())


export const set = async (score: number, features: any) => {

    if (score === null && features === null) return // No active score plugin
  
    const outputOptions = await getPlugins()

    for (const [ key, plugin ] of Object.entries(outputOptions)) {
      plugin.__score = score // Always set score
      plugin.__features = features
      if (plugin.enabled) plugin.set(score, plugin.__info)
    }
}