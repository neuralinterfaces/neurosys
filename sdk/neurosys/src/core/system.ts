import { Client } from "./client"

export class System {

  client: null | Client = null

  connect = async (
    device: any,
    protocol: string,
  ) => {
    
    if (this.client) return console.error('Client already connected')
    this.client = new Client(device)
    const result = await this.client.connect(protocol)
    console.log('Connected to device', result, this.onDeviceConnected)
    this.onDeviceConnected()
    return result
  }
  
  reset = async () => {

    if (this.client) {
      await this.client.disconnect()
      console.log('Disconnected from device', this.onDeviceConnected)
      this.onDeviceDisconnected()
    }

    this.client = null
  }


  onDeviceConnected = async () => {}
  onDeviceDisconnected = async () => {}

}