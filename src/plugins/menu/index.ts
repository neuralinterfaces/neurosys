// NOTE: Paths are relative to project root
export const assets = {
    icon: "./src/tray/iconTemplate.png",
    icon2x: "./src/tray/iconTemplate@2x.png"
}

export function load() {
    return {
        showDeviceSelector: (callback) => this.on("devices.show", () => callback()),

        // Feedback Mechanisms
        registerFeedback: (key, plugin) => this.send("feedback.register", { key, plugin }),
        onToggle: (key, callback) => this.on(`feedback.${key}.toggle`, (_, enabled) => callback(enabled)),

        // Connection
        toggleDeviceConnection: (on = true) => this.send("connection.toggle", on),
        onDeviceDisconnect: (callback) => this.on("device.disconnect", () => callback()),
    }
}

export const desktop = {
    load: function () {

        const { plugin: { assets: { icon } }, electron } = this

        const { Menu, BrowserWindow, Tray, MenuItem } = electron

        const tray = new Tray(icon);

        const template = [
            { id: 'feedback', label: "Toggle Feedback", submenu: [] },
            { type: 'separator' },
            { label: 'Quit', role: 'quit' }
        ]

        const rebuildMenu = () => Menu.buildFromTemplate(template)
        const updateContextMenu = () => tray.setContextMenu(rebuildMenu())

        const menu = rebuildMenu()

        const toggleConnection = (on = true) => {
            const idx = template.findIndex(item => item.id === "connect")

            const newItem = new MenuItem({
                id: "connect",
                label: on ? "Connect to Device" : "Disconnect Device",
                click: () => on ? this.send("devices.show") : this.send("device.disconnect")
            })

            if (idx > -1) template[idx] = newItem
            else template.unshift(newItem)

            updateContextMenu()
        }

        toggleConnection(true)
        updateContextMenu()

        tray.setToolTip('System Neurofeedback');
        tray.on('click', () => tray.popUpContextMenu()); // On Windows, it's ideal to open something from the app here...

        this.on("connection.toggle", (_, on) => toggleConnection(on))

        const registered = {}
        this.on("feedback.register", (_, { key, plugin }) => {

            if (registered[key]) return

            const { feedbackInfo, enabled = false } = plugin
            const { name } = feedbackInfo

            const feedbackSubmenu = template.find(item => item.id === "feedback").submenu as any[]

            const item = new MenuItem({
                label: name,
                type: 'checkbox',
                checked: enabled,
                click: () => this.send(`feedback.${key}.toggle`, item.checked)
            })

            feedbackSubmenu.push(item)
            updateContextMenu()

            registered[key] = true
        })
    }
}