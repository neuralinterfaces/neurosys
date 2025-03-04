import { Client } from "./client"
import { DataStream } from "./plugins/types"

const findLongestArrayInObjectRecursive = (obj: Record<string, any>) => {
    return Object.values(obj).reduce((acc, value) => {
        if (Array.isArray(value)) return value.length > acc ? value.length : acc
        if (value && typeof value === "object") return Math.max(acc, findLongestArrayInObjectRecursive(value))
        return acc
    }, 0)
}

const isObject = (value: any) => value && typeof value === "object"

const flatten = (obj: Record<string, any>, i = 0, prefix = ""): Record<string, any> => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        const identifier = prefix ? `${prefix}/${key}` : key
        if (Array.isArray(value)) return { ...acc, [identifier]: isObject(value[i]) ? `"${JSON.stringify(value[i]).replaceAll('"', '""')}"` : value[i] } // Ensure objects can be encoded properly
        if (isObject(value)) return { ...acc, ...flatten(value, i, identifier) }
        return { ...acc, [identifier]: i === 0 ? value : undefined }
    }, {})
}

export const convertObjectToCSV = (object: Record<string, any>) => {
    const nRows = findLongestArrayInObjectRecursive(object);
    const records = Array.from({ length: nRows }, (_, i) => flatten(object, i));
    const headers = records.reduce((acc, record) => Object.keys(record).reduce((acc, key) => acc.includes(key) ? acc : acc.concat(key), acc), []) as string[];
    const rows = [ headers, ...records.map((record) => headers.map((header) => record[header] ?? "")) ];
    return rows.map((row) => row.join(",")).join("\n");
};

export class Recording {

  client: Client
  streams: Record<string, DataStream> = {}

  constructor(client: Client) {
    this.client = client
  }

  #subscription?: symbol

  start = () => {
    this.streams = Object.entries(this.client.streams).reduce((acc, [ key, value ]) => ({ ...acc, [key]: new DataStream(value) }), {})
    this.#subscription = this.client.subscribe((update, stream) => this.streams[stream] && this.streams[stream].update(update))
  }

  stop = () => {
    if (this.#subscription) this.client.unsubscribe(this.#subscription)
  }

  save = () => {

    const { streams,  client } = this

    const device = {
      name: client.device.name,
      protocol: client.protocol,
      streams: streams
    }

    const csv = convertObjectToCSV({
      device,
      // features: {},
      // score: {
      //   name: 'score',
      //   data: {}
      // }
    })


    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    const dateString = new Date().toISOString()
    a.download = `${device.name}-${dateString}.csv`

    a.click()
    URL.revokeObjectURL(url)
  }

}
