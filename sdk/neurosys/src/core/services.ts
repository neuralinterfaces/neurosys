import { NEUROSYS_SUBROUTE } from "../services/globals"
import { getTransformedKey, PluginType } from "./plugins"

type URL = string

type ServicePluginInfo = {
    service: string
    plugin: string
    type: PluginType
    info: Record<string, any>
}

export const getServerSidePlugins = async (url: URL): Promise<ServicePluginInfo[]> => {
    return await fetch(url).then(res => res.json()).then(({ success, error, result }) => {

        if (!success) throw new Error(error)

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


export const getAllServerSidePlugins = async (
    services: Record<string, string>
) => {

  const serviceIds = Object.keys(services)

  const servicePromises = Object.entries(services).map(([ serviceId, baseUrl ]) => {

    const scopedUrl = new URL(NEUROSYS_SUBROUTE, baseUrl)

    return getServerSidePlugins(scopedUrl).then((plugins) => {
      
      return plugins.reduce((acc, plugin) => {
        const { plugin: identifier, type, info } = plugin

        const allowedMethods = methodsForType[type]
        if (!allowedMethods) return acc

        const url = new URL(`${NEUROSYS_SUBROUTE}/${identifier}`, baseUrl) // Scope the requests to the Neurosys route

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

        const transformed = getTransformedKey(type, identifier, serviceId)
        
        acc[transformed] = { 
          ...info, 
          ...overrides, 
        }

        return acc
      }, {})
    })
  })

  return Promise.allSettled(servicePromises).then(settled => {
    return settled.reduce((acc, info, idx) => {
      const { status, value, reason } = info
      if (status === 'fulfilled') return {...acc, [serviceIds[idx]]: value}
      console.error(`Failed to load service plugins for ${serviceIds[idx]}`, reason)
      return acc

    }, {})
  })
}