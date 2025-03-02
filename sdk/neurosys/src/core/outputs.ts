import { resolvePlugins } from "./commoners"
import { Score } from "./score"

export const onToggle = async (fn: Function) => {
    const { menu: { onOutputToggle } } = await resolvePlugins()
    onOutputToggle(fn)
}

export const registerPlugin = (
  plugin: any, 
) => {

    const { label, enabled, start, stop, set, settings, __commoners } = plugin

    return { 
      label,
      start, 
      stop, 
      set, 
      enabled,
      settings,
      __commoners,
      __latest: {}, 
      __info: {}
    }
}

export const set = async (__score: Score, features: any, collection: Record<string, any>) => {
    const score = __score.get()
  
    for (const [ key, plugin ] of Object.entries(collection)) {
      const resolvedFeatures = { score, __score, ...features ?? {} }
      if (plugin.enabled) plugin.set(resolvedFeatures, plugin.__info)
      plugin.__latest = resolvedFeatures
    }

}