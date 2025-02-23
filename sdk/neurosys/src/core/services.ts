import { PluginType } from "./plugins"

type URL = string

type ServicePluginInfo = {
    service: string
    plugin: string
    type: PluginType
    info: Record<string, any>
}

export const getServicePlugins = async (url: URL): Promise<ServicePluginInfo[]> => {
    return await fetch(url).then(res => res.json()).then(result => {
        const plugins = Object.entries(result).reduce((acc, [ plugin, value ]) => {
            const { type, info } = value
            acc.push({ plugin, type, info })
            return acc
        }, [])

        return plugins
    })
}


export async function sendToServicePlugin (
    url: string | URL, 
    pathname?: string,
    ...args: any[]
) {

    if (pathname) {
        const existing = new URL(url).pathname
        const merged = [existing, pathname].join('/')
        url = new URL(merged, url).toString()
    }

    const ctx = this ?? {}

    const result = await fetch(url, { method: 'POST',  body: JSON.stringify({ args, ctx }) }).then(res => res.json())
    if (!result.success) throw new Error(result.error)
    return result.result
}