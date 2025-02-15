export default {
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

            const homeDir = path.join(require('os').homedir(), 'neurosys')
            const settingsDir = path.join(homeDir, 'settings')

            const getSettingsPath = (name: string) => path.join(settingsDir, `${name}.json`)

            this.on('set', (event, name, data) => {
                const filePath = getSettingsPath(name)
                if (!fs.existsSync(settingsDir)) fs.mkdirSync(settingsDir, { recursive: true })
                fs.writeFileSync(filePath, JSON.stringify(data))
                event.returnValue = true
            })

            this.on('get', (event, name) => {
                const filePath = getSettingsPath(name)
                if (!fs.existsSync(filePath)) return event.returnValue = {}
                const data = fs.readFileSync(filePath)
                const parsed = JSON.parse(data)
                return event.returnValue = parsed
            })

        }
    }
}