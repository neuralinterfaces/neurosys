import { getNamespace, getOriginalKey, PluginType } from "./plugins"

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

    console.log('SENDING', url)
    const result = await fetch(url, { method: 'POST',  body: JSON.stringify({ args, ctx }) }).then(res => res.json())
    if (!result.success) throw new Error(result.error)
    return result.result
}


const getServiceUrl = (url: string | URL, encoded: string) => {
  const key = getOriginalKey(encoded)
  const namespace = getNamespace(encoded)

  if (namespace) return new URL(`${namespace}/${key}`, url)
  return new URL(key, url)
}

const methodsForType = {
  output: ['start', 'set', 'stop'],
  score: ['get'],
  feature: ['calculate'],
  // device: ['connect', 'disconnect']
}

const preFetchMethods = {
  output: {
    set: async (...args: any[]) => {
      const { score } = args[0]
      if (isNaN(score)) return null // Don't send null to services | NOTE: Should this apply across the board?
      return args
    }
  }
}


export const requestAllServicePlugins = async (
    services: Record<string, string>
) => {

  const serviceIds = Object.keys(services)

  const servicePromises = Object.values(services).map(baseUrl => {

    return getServicePlugins(baseUrl).then(plugins => {

      return plugins.reduce((acc, plugin) => {
        const { plugin: identifier, type, info } = plugin

        const allowedMethods = methodsForType[type]
        if (!allowedMethods) return

        const url = getServiceUrl(baseUrl, identifier)

        const methods = Object.keys(info).filter(method => allowedMethods.includes(method))

        const overrides = methods.reduce((acc, method) => {
          acc[method] = async function (...args) {
            const preFetch = preFetchMethods[type]?.[method]

            if (preFetch) {
              const result = await preFetch(...args)
              if (result == null) return
              args = Array.isArray(result) ? result : [ result ]
            }

            return sendToServicePlugin.call(this, url, method, ...args)
          }
          return acc
        }, {})

        acc[identifier] = { ...info, ...overrides }

        return acc
      }, {})
    })
  })

  return Promise.allSettled(servicePromises).then(settled => {
    return settled.reduce((acc, info, idx) => {
      const { status, value } = info
      if (status === 'fulfilled') acc[serviceIds[idx]] = value
      return acc
    }, {})
  })
}