import { Device } from "./plugins"
import { DataStream, NotifyCallback } from "./plugins/types"
import { convertObjectToCSV } from "./recording"

export class Client {
  device: Device
  streams: Record<string, DataStream> = {} // Client data is stored as data collections

  #protocol: string = ''

  constructor(device: Device) {
    this.device = device
  }

  connect = async (protocol: string) => {

        if (!this.device.connect) return console.error('Device does not support connection')

        // Show device selection
        const notify: NotifyCallback = (update, stream) => {
          const selected = this.streams[stream]
          if (!selected) return console.warn('Data stream not found', stream)
          selected.update(update) 
      }
      
      const structure = await this.device.connect({ protocol }, notify)
      this.streams = Object.entries(structure).reduce((acc, [ stream , info ]) => ({...acc, [stream]: new DataStream(info) }), {})
      this.#protocol = protocol

      return this.streams
  }

  disconnect = async () => {
    if (!this.device.disconnect) return console.error('Device does not support disconnection')
    this.#protocol = ''
    return await this.device.disconnect()
  }


  save = () => {
        const { name, protocol, streams } = this
        const csv = convertObjectToCSV({
        device: {
            name: this.device.name,
            protocol: this.#protocol,
            streams: this.streams
        },
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
        a.download = `${name}-${dateString}.csv`

        a.click()
        URL.revokeObjectURL(url)
  }

}