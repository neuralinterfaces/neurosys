type Icon = {
    icon: string
    [key: string]: string
}

export default (icons: Icon) => {
    return {
        assets: icons,
        load() {
            return {
                showDeviceSelector: (callback) => this.on("devices.show", () => callback()),

                // Output Mechanisms
                registerOutput: (key, plugin) => this.sendSync("outputs.register", { key, plugin }),
                onOutputToggle: (callback) => this.on(`outputs.toggle`, (_, key, enabled) => callback(key, enabled)),

                // Score Mechanisms
                registerScore: (key, plugin) => this.sendSync("score.register", { key, plugin }),
                onScoreToggle: (callback) => this.on(`score.toggle`, (_, key, enabled) => callback(key, enabled)),

                // Connection
                toggleDeviceConnection: (on = true) => this.send("connection.toggle", on),
                onDeviceDisconnect: (callback) => this.on("device.disconnect", () => callback()),

                // Settings
                onSaveSettings: (callback) => this.on("settings.save", () => callback()),
                loadSettings: (settings) => this.send("settings.load", settings),
                enableSettings: (enabled) => this.send("settings.enabled", enabled)
            }
        },

        desktop: {
            load() {

                const { plugin: { assets: { icon } }, electron } = this

                const { Menu, BrowserWindow, Tray, MenuItem } = electron

                const tray = new Tray(icon);

                const SUBMENU_IDS = {
                    score: "score",
                    outputs: "outputs"
                }

                const template = [
                    { id: "settings", label: "Save Settings", enabled: false, click: () => this.send("settings.save") },
                    { type: 'separator' },
                    { id: SUBMENU_IDS.score, label: "Score", submenu: [] },
                    { id: SUBMENU_IDS.outputs, label: "Outputs", submenu: [] },
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

                tray.setToolTip('neurosys');
                tray.on('click', () => tray.popUpContextMenu()); // On Windows, it's ideal to open something from the app here...

                this.on("connection.toggle", (_, on) => toggleConnection(on))

                this.on("settings.enabled", (_, enabled) => {
                    const idx = template.findIndex(item => item.id === "settings")
                    template[idx].enabled = enabled
                    updateContextMenu()
                })

                const REGISTERED = { outputs: {}, score: {} }
                const sendState = (id, key, enabled) => REGISTERED[id]?.[key] && this.send(`${id}.toggle`, key, enabled)
                const getAllItems = (id) => template.find(item => item.id === id)?.submenu ?? []
                const updateAllStates = (id) => getAllItems(id).forEach(item => sendState(id, item.id, item.checked))

                const registerNewItem = (
                    id,
                    key,
                    options,
                    updateAll = false
                ) => {

                    const registered = REGISTERED[id] ?? (REGISTERED[id] = {})
                    if (registered[key]) return false

                    const foundItem = template.find(item => item.id === id)
                    if (!foundItem) return

                    const submenu = foundItem.submenu as any[]

                    const item = new MenuItem({
                        id: key,
                        ...options,
                        click: () => updateAll ? updateAllStates(id) : sendState(id, key, item.checked)
                    })

                    submenu.push(item)
                    updateContextMenu()

                    registered[key] = true

                    return true

                }

                // ------------------------- Define Setting Options ------------------------- \\
                this.on("outputs.register", (ev, { key, plugin }) => {
                    const { enabled = false, ...options } = plugin
                    const success = registerNewItem(SUBMENU_IDS.outputs, key, { type: 'checkbox', checked: enabled, ...options })
                    ev.returnValue = success
                })

                this.on("score.register", (ev, { key, plugin }) => {
                    const { enabled = false, ...options } = plugin
                    const success = registerNewItem(SUBMENU_IDS.score, key, { type: 'radio', checked: enabled, ...options }, true)
                    ev.returnValue = success
                })

                // ------------------------- Allow Configuration based on Settings ------------------------- \\

                this.on("settings.load", (_, settings) => {

                    for (const [id, registered] of Object.entries(REGISTERED)) {
                        const categorySettings = settings[id] ?? {}
                        const itemMetadata = Object.entries(registered).map(([key, _]) => {
                            const itemSettings = categorySettings[key] ?? {}
                            const { enabled = false } = itemSettings

                            const actualMenuItem = template.find(item => item.id === id).submenu.find(item => item.id === key)
                            if (actualMenuItem) {
                                const isRadio = actualMenuItem.type === "radio"
                                if (!isRadio || enabled) actualMenuItem.checked = enabled
                                return { radio: isRadio, item: actualMenuItem, enabled }
                            }
                        })

                        // Enable the first radio item by default, if none are enabled
                        const radioItems = itemMetadata.filter(item => item?.radio)
                        if (radioItems.length && !radioItems.find(item => item?.enabled)) radioItems[0].item.checked = true

                        updateAllStates(id) // Update all other states in case any changed
                    }

                    updateContextMenu()
                })

            }
        }
    }
}