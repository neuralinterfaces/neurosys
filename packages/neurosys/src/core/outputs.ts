import { Output, Context } from "./plugins"


export type EnhancedOutputPlugin = Output & {
  enabled: boolean,
  __latest?: Record<string, any>,
  __ctx: Context
}

export const registerPlugin = (
  plugin: any, 
) => {
    const { __commoners } = plugin
    const copy = new Output(plugin) as EnhancedOutputPlugin
    copy.__ctx = { commoners: __commoners } // NOTE: Resolving settings later
    return copy
}