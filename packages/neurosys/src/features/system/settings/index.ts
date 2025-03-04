type SettingsOptions = {
    directory: string
    defaultContent?: any
}

export default ({ defaultContent, directory }: SettingsOptions) => ({
    
    load() {
        return {
            get: (name) => this.sendSync('get', name),
            set: (name, value) => this.sendSync('set', name, value)
        }
    },

    desktop: {
        load() {

            const fs = require('fs')
            const path = require('path')

            const homeDir = path.join(require('os').homedir(), directory)
            const protocolsDir = path.join(homeDir, 'protocols')

            const getProtocolsPath = (name: string) => path.join(protocolsDir, `${name}.json`)

            this.on('set', (event, name, data) => {
                const filePath = getProtocolsPath(name)
                if (!fs.existsSync(protocolsDir)) fs.mkdirSync(protocolsDir, { recursive: true })
                fs.writeFileSync(filePath, JSON.stringify(data))
                event.returnValue = true
            })

            this.on('get', (event, name) => {
                const filePath = getProtocolsPath(name)
                if (!fs.existsSync(filePath)) return event.returnValue = defaultContent
                const data = fs.readFileSync(filePath)
                const parsed = JSON.parse(data)
                return event.returnValue = parsed
            })

        }
    }
})