import { Output } from "./plugins"

export type EnhancedOutputPlugin = Output & {
  enabled: boolean,
  __commoners?: any,
  __latest: Record<string, any>,
  __info: Record<string, any>
}

export const registerPlugin = (
  plugin: any, 
) => {
    const { __commoners } = plugin
    const copy = new Output(plugin) as EnhancedOutputPlugin
    copy.__commoners = __commoners
    copy.__latest = {}
    copy.__info = {}
    return copy
}