
type URL = string

type ServicePluginInfo = {
    service: string
    plugin: string
    type: string
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


export const sendToOutputPlugin = async (url: string | URL, score: number) => {
    if (isNaN(score)) return // Only send valid scores
    return await fetch(url, { 
        method: 'POST', 
        body: JSON.stringify({ score }) 
    })
}