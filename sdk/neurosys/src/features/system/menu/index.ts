type Icon = {
    icon: string
    [key: string]: string
}

export default (icons: Icon) => {
    return {
        assets: icons,
        load() {


            const managedItems = {}

            this.on("menu.click", (_, id) => {  
                const onClick = managedItems[id]
                if (onClick) onClick()
            })

            return {

                // Output Mechanisms
                registerOutput: (key, plugin) => this.sendSync("outputs.register", { key, plugin }),
                onOutputToggle: (callback) => this.on(`outputs.toggle`, (_, key, enabled) => callback(key, enabled)),

                // Evaluation Mechanisms
                registerEvaluation: (key, plugin) => this.sendSync("evaluations.register", { key, plugin }),
                onEvaluationToggle: (callback) => this.on(`evaluations.toggle`, (_, key, enabled) => callback(key, enabled)),

                // Settings
                onSaveSettings: (callback) => this.on("settings.save", () => callback()),
                loadSettings: (settings) => this.send("settings.load", settings),
                enableSettings: (enabled) => this.send("settings.enabled", enabled),

                // Menu Item Management
                add: (id, options) => {
                    const { onClick, ...rest } = options
                    const result = this.sendSync("menu.add", { id, options: rest })
                    if (result) managedItems[id] = onClick
                    return result
                },
                update: (id, options) => {
                    const { onClick, ...rest } = options
                    const result = this.sendSync("menu.update", { id, options: rest })
                    if (result) managedItems[id] = onClick
                    return result
                },
                remove: (id) => {
                    const result = this.sendSync("menu.remove", id)
                    if (result) delete managedItems[id]
                    return result
                }
            }
        },

        desktop: {
            load() {

                const { plugin: { assets: { icon } }, electron } = this

                const { Menu, BrowserWindow, Tray, MenuItem } = electron

                const tray = new Tray(icon);

                const SUBMENU_IDS = {
                    evaluations: "evaluations",
                    outputs: "outputs"
                }


                const template = [
                    { type: 'separator' },
                    { id: SUBMENU_IDS.evaluations, label: "Score", submenu: [] },
                    { id: SUBMENU_IDS.outputs, label: "Outputs", submenu: [] },
                    { id: "settings", label: "Save Settings", enabled: false, click: () => this.send("settings.save") },
                    { type: 'separator' },
                    { label: 'Quit', role: 'quit' }
                ]

                const rebuildMenu = () => {

                    // Remove empty submenus
                    const templateWithoutEmptySubmenus = template.filter(item => {
                        if (item.submenu && item.submenu.length === 0) return false
                        return true
                    })

                    
                    // Remove settings menu item if no submenu is active
                    const anyActiveSubmenus = templateWithoutEmptySubmenus.some(item => item.submenu)
                    if (!anyActiveSubmenus) {
                        const settingsIdx = templateWithoutEmptySubmenus.findIndex(item => item.id === "settings")
                        if (settingsIdx > -1) templateWithoutEmptySubmenus.splice(settingsIdx, 1)
                    }
                        
                    // Remove duplicate separators
                    const noDuplicateSeparators = templateWithoutEmptySubmenus.reduce((acc, item, idx) => {
                        if (item.type === 'separator' && acc[acc.length - 1]?.type === 'separator') return acc
                        acc.push(item)
                        return acc
                    }, [])

                    // Build the menu
                    return Menu.buildFromTemplate(noDuplicateSeparators)
                }

                const updateContextMenu = () => tray.setContextMenu(rebuildMenu())

                tray.setToolTip('neurosys');
                tray.on('click', () => tray.popUpContextMenu()); // On Windows, it's ideal to open something from the app here...

                this.on("connection.toggle", (_, on) => toggleConnection(on))

                this.on("settings.enabled", (_, enabled) => {
                    const idx = template.findIndex(item => item.id === "settings")
                    template[idx].enabled = enabled
                    updateContextMenu()
                })

                const REGISTERED = { outputs: {}, evaluations: {} }
                const sendState = (id, key, enabled) => REGISTERED[id]?.[key] && this.send(`${id}.toggle`, key, enabled)
                const getAllItems = (id) => template.find(item => item.id === id)?.submenu ?? []
                const updateAllStates = (id) => getAllItems(id).forEach(item => sendState(id, item.id, item.checked))

                const registerNewSubItem = (
                    id,
                    key = id,
                    options
                ) => {

                    const registered = REGISTERED[id] ?? (REGISTERED[id] = {})
                    if (registered[key]) return false

                    const foundItem = template.find(item => item.id === id)
                    if (!foundItem) return

                    const submenu = foundItem.submenu as any[]

                    const item = new MenuItem({
                        id: key,
                        ...options,
                        click: () => options.onClick && options.onClick(item)
                    })

                    submenu.push(item)
                    updateContextMenu()

                    registered[key] = true

                    return true
                }

                const registerNewItem = (id, options) => {
                    const foundItemIdx = template.findIndex(item => item.id === id)
                    if (foundItemIdx > -1) template.splice(foundItemIdx, 1) // Remove the item if it already exists

                    const indexOfFirstSeparator = template.findIndex(item => item.type === 'separator')
                    const insertIdx = indexOfFirstSeparator > -1 ? indexOfFirstSeparator : template.length - 1

                    const item = new MenuItem({
                        id,
                        ...options,
                        click: () => options.onClick && options.onClick(item)
                    })

                    template.splice(insertIdx, 0, item)
                    
                    updateContextMenu()

                    return true
                }

                const updateMenuItem = (id, options) => {
                    const foundItem = template.find(item => item.id === id)
                    if (!foundItem) return false
                    Object.assign(foundItem, options)
                    updateContextMenu()
                    return true
                }

                // ------------------------- Define Setting Options ------------------------- \\
                this.on("outputs.register", (ev, { key, plugin }) => {
                    const { enabled = false, ...options } = plugin

                    const success = registerNewSubItem(SUBMENU_IDS.outputs, key, { 
                        type: 'checkbox', 
                        checked: enabled, 
                        onClick: (item) => sendState(SUBMENU_IDS.outputs, key, item.checked),
                        ...options 
                    })

                    ev.returnValue = success
                })

                this.on("evaluations.register", (ev, { key, plugin }) => {
                    const { enabled = false, ...options } = plugin

                    const success = registerNewSubItem(SUBMENU_IDS.evaluations, key, { 
                        type: 'radio', 
                        checked: enabled, 
                        onClick: () =>  updateAllStates(SUBMENU_IDS.evaluations),
                        ...options 
                    })

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

                this.on("menu.add", (ev, { id, options }) => {
                    const success = registerNewItem(id, { ...options, onClick: () => this.send("menu.click", id) })
                    ev.returnValue = success
                })

                this.on("menu.update", (ev, { id, options }) => {
                    const success = updateMenuItem(id, { ...options })
                    ev.returnValue = success
                })

                this.on("menu.remove", (ev, id) => {
                    const foundItem = template.find(item => item.id === id)
                    if (!foundItem) return ev.returnValue = false

                    const submenu = foundItem.submenu as any[]
                    const idx = submenu.findIndex(item => item.id === id)
                    if (idx > -1) submenu.splice(idx, 1)

                    updateContextMenu()
                    ev.returnValue = true
                })

            }
        }
    }
}