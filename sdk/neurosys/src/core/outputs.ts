import { resolvePlugins } from "./commoners"
import { isPluginInNamespace, NAMESPACES } from "./plugins"

export const onToggle = async (fn: Function) => {
    const { menu: { onOutputToggle } } = await resolvePlugins()
    onOutputToggle(fn)
}

let outputOptions: any;

type RegisterFunction = (key: string, info: any) => void

export const registerPlugin = async (
  identifier: string, 
  plugin: any, 
  collection,
  register?: RegisterFunction
) => {
    
    if (!register) {
      const PLUGINS = await resolvePlugins()
      const { menu: { registerOutput } } = PLUGINS
      register = registerOutput
    }

    const resolvedRegisterFn = register as RegisterFunction

    const { label, enabled, start, stop, set, settings } = plugin
    collection[identifier] = { 
      start, 
      stop, 
      set, 
      enabled,
      settings,
      __latest: {}, 
      __info: {}
    }

    resolvedRegisterFn(identifier, { label, enabled })

    return collection

}

const registerAllOutputOptions = async () => {
  const PLUGINS = await resolvePlugins()
  const { menu: { registerOutput } } = PLUGINS

  return Object.keys(PLUGINS).reduce((acc, key) => {
    if (!isPluginInNamespace(NAMESPACES.outputs, key)) return acc
    const plugin = PLUGINS[key]
    registerPlugin(key, plugin, acc, registerOutput)
    return acc
  }, {})
}

export const getPlugins = async () => outputOptions ?? (outputOptions = await registerAllOutputOptions())

export const set = async (score: number, features: any) => {

    if (score === null && features === null) return // No active score plugin
  
    const outputOptions = await getPlugins()

    for (const [ key, plugin ] of Object.entries(outputOptions)) {

      const resolvedFeatures = plugin.__latest = { score, ...features ?? {} }

      if (plugin.enabled) plugin.set(resolvedFeatures, plugin.__info)
    }
}