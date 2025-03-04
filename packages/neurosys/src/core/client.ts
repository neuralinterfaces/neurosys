import { Device } from "./plugins"
import { DataStream, NotifyCallback } from "./plugins/types"

export class Client {
  device: Device
  streams: Record<string, DataStream> = {} // Client data is stored as data collections

  protocol: string = ''

  constructor(device: Device) {
    this.device = device
  }

  #notificationCallbacks: Record<symbol, NotifyCallback> = {}

  connect = async (protocol: string) => {

      if (!this.device.connect) return console.error('Device does not support connection')

        // Show device selection
      const structure = await this.device.connect({ protocol }, (update, stream) => Object.getOwnPropertySymbols(this.#notificationCallbacks).forEach(symbol => this.#notificationCallbacks[symbol](update, stream)))
      this.subscribe((update, stream) => this.streams[stream] && this.streams[stream].update(update) )

      this.streams = Object.entries(structure).reduce((acc, [ stream , info ]) => ({ ...acc, [stream]: new DataStream(info) }), {})
      this.protocol = protocol

      return this.streams
  }

  subscribe = (callback: NotifyCallback) => {
    const symbol = Symbol()
    this.#notificationCallbacks[symbol] = callback
    return symbol
  }

  unsubscribe = (symbol: symbol) => {
    delete this.#notificationCallbacks[symbol]
  }

  disconnect = async () => {
    if (!this.device.disconnect) return console.error('Device does not support disconnection')
    this.protocol = ''
    this.#notificationCallbacks = {}
    return await this.device.disconnect()
  }

}