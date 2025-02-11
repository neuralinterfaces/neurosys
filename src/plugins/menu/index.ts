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
        onFeedbackToggle: (key, callback) => this.on(`feedback.${key}.toggle`, (_, enabled) => callback(enabled)),

        // Score Mechanisms
        registerScore: (key, plugin) => this.send("score.register", { key, plugin }),
        onScoreToggle: (key, callback) => this.on(`score.${key}.toggle`, (_, enabled) => callback(enabled)),

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

        const SUBMENU_IDS = {
            score: "score",
            feedback: "feedback"
        }

        const template = [
            { id: SUBMENU_IDS.feedback, label: "Show Feedback", submenu: [] },
            { id: SUBMENU_IDS.score, label: "Choose Score", submenu: [] },
            { type: 'separator' },
            { label: 'Quit', role: 'quit' }
        ]

        const rebuildMenu = () => Menu.buildFromTemplate(template)
        const updateContextMenu = () => tray.setContextMenu(rebuildMenu())

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

        const registered = {
            feedback: {},
            score: {}
        }

        const sendState = (id, key, enabled) => registered[id][key] && this.send(`${id}.${key}.toggle`, enabled)
        const getAllItems = (id) => template.find(item => item.id === id)?.submenu ?? []
        const updateAllStates = (id) => getAllItems(id).forEach(item => sendState(id, item.id, item.checked))

        const registerNewItem = (
            id, 
            key, 
            options,
            onClick?: Function
        ) => {

            if (registered[id][key]) return

            const foundItem = template.find(item => item.id === id)
            if (!foundItem) return

            const submenu = foundItem.submenu as any[]

            const item = new MenuItem({
                id: key,
                ...options,
                click: () => onClick ? onClick(key, item) : this.send(`${id}.${key}.toggle`, item.checked)
            })

            submenu.push(item)
            updateContextMenu()

            registered[id][key] = true
        }

        this.on("feedback.register", (_, { key, plugin }) => {
            const { feedback, enabled = false } = plugin
            registerNewItem(SUBMENU_IDS.feedback, key, { type: 'checkbox', checked: enabled, ...feedback })
        })


        this.on("score.register", (_, { key, plugin }) => {

            const id = SUBMENU_IDS.score
            const { score, enabled = false } = plugin
            registerNewItem(
                id, 
                key, 
                { type: 'radio', checked: enabled, ...score },
                () => updateAllStates(id)
            )

        })
    }
}