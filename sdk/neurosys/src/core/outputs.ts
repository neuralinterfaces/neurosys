import { resolvePlugins } from "./commoners"
import { Score } from "./score"

import type { RegisterFunction } from "./plugins"

export const onToggle = async (fn: Function) => {
    const { menu: { onOutputToggle } } = await resolvePlugins()
    onOutputToggle(fn)
}

const outputOptions: Record<string, any> = {}

export const registerPlugin = async (
  identifier: string, 
  plugin: any, 
  register?: RegisterFunction
) => {
    
  if (outputOptions[identifier]) return console.error('Output plugin is already registered', identifier, plugin)


    if (!register) {
      const PLUGINS = await resolvePlugins()
      const { menu: { registerOutput } } = PLUGINS
      register = registerOutput
    }

    const resolvedRegisterFn = register as RegisterFunction

    const { label, enabled, start, stop, set, settings, __commoners } = plugin

    outputOptions[identifier] = { 
      start, 
      stop, 
      set, 
      enabled,
      settings,
      __commoners,
      __latest: {}, 
      __info: {}
    }

    resolvedRegisterFn(identifier, { label, enabled })
}

export const getPlugin = (key: string) => outputOptions[key]

export const togglePlugin = (key: string, state?: boolean) => {
  const plugin = getPlugin(key)
  return plugin.enabled = typeof state === 'boolean' ? state : !plugin.enabled
}

export const set = async (__score: Score, features: any) => {
    const score = __score.get()
  
    for (const [ key, plugin ] of Object.entries(outputOptions)) {
      const resolvedFeatures = { score, __score, ...features ?? {} }
      if (plugin.enabled) plugin.set(resolvedFeatures, plugin.__info)
      plugin.__latest = resolvedFeatures
    }

}