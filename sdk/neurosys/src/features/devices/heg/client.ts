// Derived from Documentation: https://github.com/joshbrew/HEG_ESP32_Delobotomizer/blob/ad7336123e8c6be35c5006e82142c94ca79fc471/Firmware/MAX86141_HEG/BLE_API.h#L62

const namePrefix = 'HEG'

const bleIDs = {
    service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    receiver: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
    notifications: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
}

const serialIDs = {
    usbVendorID: 0x10c41,
    productId: 0x0043,
}

const HEG_SFREQ = 25

const DATA_DELIMITER = "|"


type BaseDevice = {
    reader: ReadableStreamDefaultReader<Uint8Array>
}

type SerialDevice = BaseDevice & {
    port: SerialPort,
    closedPromise: Promise<void>
}

type BLEDevice = BaseDevice & {
    device: BluetoothDevice
    server: BluetoothRemoteGATTServer
    service: BluetoothRemoteGATTService
    receiver: BluetoothRemoteGATTCharacteristic
    notifications: BluetoothRemoteGATTCharacteristic
}

export class HEGClient{

    get sfreq(){
        return HEG_SFREQ
    }

    constructor(){

    }

    #encoder = new TextEncoder();
    #decoder = new TextDecoder("utf-8");
    #device: null | SerialDevice | BLEDevice = null


    #evTarget = new EventTarget()

    async connect({ protocol }){
        if(protocol === 'ble') return this.connectBLE()
        return this.connectSerial()
    }

    #onLineRead = (line: string) => {
        if (!line.includes(DATA_DELIMITER)) return console.error("Invalid HEG Line:", line)
        const arr = line.replace(/[\n\r]+/g, '').split(DATA_DELIMITER);
        const [ microseconds, red, ir, __, ambient, ___, ____ ] = arr
        const data = { red: parseFloat(red), ir: parseFloat(ir), ambient: parseFloat(ambient), time: parseInt(microseconds) }
        this.#evTarget.dispatchEvent(new CustomEvent('parsed-data', { detail: data }))
    }

    async write(msg: string){
        if(!this.#device) return
        try {
            const data = this.#encoder.encode(msg)
            if('receiver' in this.#device) await this.#device.receiver.writeValue(data)
            else {
                const writer = this.#device.port.writable.getWriter()
                await writer.write(data)
                writer.releaseLock()
            }
        } catch (error) {
            console.warn("Failed to send data", error)
        }
    }

    async connectBLE (){

        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [ bleIDs.service ] }, { namePrefix } ],
            optionalServices: [ bleIDs.service ],
        })

        const server = await device.gatt.connect()
        const service = await server.getPrimaryService(bleIDs.service)
        const receiver = await service.getCharacteristic(bleIDs.receiver)
        const notifications = await service.getCharacteristic(bleIDs.notifications)
        const reader = await notifications.startNotifications()
        notifications.addEventListener('characteristicvaluechanged', (ev) =>{ 
            const line = this.#decoder.decode(ev.target.value);
            this.#onLineRead(line)
        }) 

        this.#device = { device, server, service, receiver, notifications, reader }
    }

    start = async () => this.write("t")
    stop = async () => this.write("f")
    enableFastMode = async () => this.write("o")
    reset = async () => this.write("R")

    subscribe = (callback: Function) => this.#evTarget.addEventListener('parsed-data', (ev: any) => callback(ev.detail))
    unsubscribe = (callback: Function) => this.#evTarget.removeEventListener('parsed-data', callback)

    async connectSerial(){
        const port = await navigator.serial.requestPort();
        await port.open({ 
            baudRate: 115200, 
            bufferSize: 1000,
            filters: [ serialIDs ]
        });
        const reader = port.readable.getReader();

        const closedPromise = this.#readFromSerialDevice({ port, reader }) // NOTE: Handled this way to avoid blocking
        this.#device = { 
            port, 
            reader,
            closedPromise
        }
    }

    async #readFromSerialDevice({ port, reader}) {
        return new Promise<void>(async (resolve, reject) => {

            try {
                while (port.readable) {
                    const { value, done } = await reader.read()
                    if (done) break
                    if (value) this.onReceiveAsync(value)
                }
              } catch (error) {
                console.error("Error from Serial Port", error)
                reject(error)
              } finally {
                // Allow the serial port to be closed later.
                reader.releaseLock()
                await port.close(); // Close the port
                resolve()
              }

              
        })
    }


    #buffer = ''
    onReceiveAsync(value: BufferSource){
        this.#buffer += this.#decoder.decode(value);
        let index;
        while ((index = this.#buffer.indexOf('\n')) >= 0) {
            const line = this.#buffer.substr(0, index + 1);
            this.#onLineRead(line)
            this.#buffer = this.#buffer.substr(index + 1);
        }
    }


    async disconnect(){
        if(!this.#device) return
        return 'port' in this.#device ? this.disconnectSerial() : this.disconnectBLE()
    }
    
    async disconnectSerial(){
        if (!this.#device) return
        if(!('port' in this.#device)) return
        await this.reset()
        this.#device.reader.cancel()
        await this.#device.closedPromise
        this.#device = null
    }

    async disconnectBLE(){
        if(!this.#device) return
        if (!('device' in this.#device)) return
        await this.reset()
        this.#device.device.gatt.disconnect()
        this.#device = null
    }
    
}