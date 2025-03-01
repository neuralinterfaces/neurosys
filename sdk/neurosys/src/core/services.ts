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

export const getURL = (url: string | URL, pathname?: string) => {

  if (pathname) {
    const existing = new URL(url).pathname
    const merged = [existing, pathname].join('/')
    url = new URL(merged, url).toString()
  }

  return url
}


export async function sendToServicePlugin (
    url: string | URL, 
    pathname?: string,
    ...args: any[]
) {

    const resolvedUrl = getURL(url, pathname)

    const ctx = this ?? {}
    const result = await fetch(resolvedUrl, { method: 'POST',  body: JSON.stringify({ args, ctx }) }).then(res => res.json())
    if (!result.success) throw new Error(result.error)
    return result.result
}

const methodsForType = {
  output: ['start', 'set', 'stop'],
  evaluation: ['get'],
  feature: ['calculate'],
  devices: [ 'connect', 'disconnect' ]
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

const getOverridesForPlugin = (identifier, type, info, baseUrl) => {

  const allowedMethods = methodsForType[type]

  if (!allowedMethods) return

  const url = new URL(`${NEUROSYS_SUBROUTE}/${identifier}`, baseUrl) // Scope the requests to the Neurosys route

  const methods = Object.keys(info).filter(method => allowedMethods.includes(method))

  return methods.reduce((acc, method) => {
    acc[method] = async function (...args) {
      const preFetch = preFetchMethods[type]?.[method]

      if (preFetch) {
        const result = await preFetch(...args)
        if (result == null) return
        args = Array.isArray(result) ? result : [ result ]
      }


      const result = await sendToServicePlugin.call(this, url, method, ...args)

      // Connect to the event stream for devices
      if (type === 'devices' && method === 'connect') {
          const [ _, notify ] = args
          const eventSource = new EventSource(getURL(url, method))
          eventSource.onmessage = (event) =>  notify(...JSON.parse(event.data))
          eventSource.onerror = (error) =>  console.error('EventSource failed:', error);
      }

      return result
    }
    return acc
  }, {})

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

        const transformed = getTransformedKey(type, identifier, serviceId)

        // Handle devices differently
        if (type === 'devices') {

          // NOTE: Handle this so that the proper device is targeted
          const newDevices = info.devices.map((device: any, i: number) => {
            const deviceId = `${identifier}/${i}`
            const overrides = getOverridesForPlugin(deviceId, type, device, baseUrl)
            if (!overrides) return device
            return { ...device, ...overrides }
          })

          acc[transformed] = { devices: newDevices }

        } else {
          const overrides =  getOverridesForPlugin(identifier, type, info, baseUrl)
          if (!overrides) return acc
          acc[transformed] = {  ...info,  ...overrides }
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