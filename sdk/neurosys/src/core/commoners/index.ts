import { Plugins } from "../plugins";

export const resolvePlugins = async (): Promise<Record<string, Plugins | any>> => await commoners.READY