type Icons = {
    icon: string
    [key: string]: string
}

type MenuInfo = {
    name: string
    icons: Icons,
    template?: any[]
}

export default ({ name, icons, template: inputTemplate = [] }: MenuInfo) => {
    return {
        assets: icons,
        load() {


            const managedItems: Record<string, any> = {}

            this.on("menu.click", (_, id, info = {}) => {  
                const item = managedItems[id]
                if (item.onClick) item.onClick(info) // Maintain context
            })

            return {

                // Menu Item Management
                set: (id, options) => {
                    const { onClick, ...rest } = options
                    const result = this.sendSync("menu.set", { id, options: rest })
                    if (result) managedItems[id] = options // Maintain original context
                    return result
                },

                setItem: (id, item) => {
                    const { onClick, ...rest } = item
                    const fullIdentifier = `${id}.${item.id}`
                    const result = this.sendSync("menu.setItem", id, rest)
                    if (result) managedItems[fullIdentifier] = item // Maintain original context
                    return result
                },

                setItems: (id, items) => {

                    const sanitized = items.map((item) => {
                        const { onClick, ...rest } = item
                        return rest
                    })

                    const itemsById = items.reduce((acc, item) => { 
                        acc[item.id] = item
                        return acc
                    }, {})

                    const results = this.sendSync("menu.setItems", id, sanitized)

                    for (const [ idx, result ] of results.entries()) {
                        if (result) managedItems[`${id}.${items[idx].id}`] = itemsById[items[idx].id] // Maintain original context
                    }

                    return results
                },

                setVisibility: (fullId, state = true) => {
                    const result = this.sendSync("menu.visibility", fullId, state)
                    return result
                }
            }
        },

        desktop: {
            load() {

                const { plugin: { assets: { icon } }, electron } = this

                const { Menu, BrowserWindow, Tray, MenuItem } = electron

                const tray = new Tray(icon);

                const template = structuredClone(inputTemplate) // Clone the template to avoid mutation

                const rebuildMenu = () => {

                    // Remove empty submenus
                    const templateWithoutEmptySubmenus = template.filter(item => {
                        if (item.submenu && item.submenu.length === 0) return false
                        return true
                    })

                    
                    // Remove settings menu item if no submenu is active
                    const anyActiveSubmenus = templateWithoutEmptySubmenus.some(item => item.submenu)
                    if (!anyActiveSubmenus) {
                        const settingsIdx = templateWithoutEmptySubmenus.findIndex(item => item.id === "saveSettings")
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

                tray.setToolTip(name);
                tray.on('click', () => tray.popUpContextMenu()); // On Windows, it's ideal to open something from the app here...

                const registerNewSubItem = (
                    id: string,
                    key: string,
                    options: Record<string, any>
                ) => {

                    const fullId = `${id}.${key}`

                    const foundItem = template.find(item => item.id === id)
                    if (!foundItem) return { success: false }

                    const submenu = foundItem.submenu as any[]

                    const foundSubitemIdx = submenu.findIndex(item => item.id === key)

                    const sendState = () => this.send("menu.click", fullId, { id: key, enabled: !!item.checked }) // send settings

                    const item = new MenuItem({
                        id: key,
                        ...options,
                        click: sendState
                    })

                    if (foundSubitemIdx > -1)  submenu[foundSubitemIdx] = item
                    else submenu.push(item)
                    
                    updateContextMenu()

                    return  { 
                        success: true, 
                        update: () => sendState() // Defer updating frontend with the current state
                    }
                }

                const setMenuItem = (id, options) => {
                    const foundItem = template.find(item => item.id === id)
                    if (!foundItem) return false // Cannot spontaneously add a new item


                    Object.assign(foundItem, {
                        ...options,
                        click: () => this.send("menu.click", id) // Send clicks. No state to send
                    })

                    updateContextMenu()
                    return true
                }

                this.on("menu.set", (ev, { id, options }) => {
                    const success = setMenuItem(
                        id, 
                        options
                    )
                    ev.returnValue = success
                })

                this.on("menu.setItem", (ev, id, item) => {
                    const key = item.id
                    const { success, update } = registerNewSubItem(id, key, item)
                    if (success && update) update()
                    ev.returnValue = success
                })

                this.on("menu.setItems", (ev, id, items) => {

                    const results = items.map(item => registerNewSubItem(id, item.id, item))

                    ev.returnValue = results.map(({ success, update }) => {
                        if (success && update) update() // Update the frontend after all items are registered
                        return success
                    })
                })

                this.on("menu.visibility", (ev, fullId, visible) => {

                    const [ id, subId ] = fullId.split('.')

                    const foundItem = template.find(item => item.id === id)
                    if (!foundItem) return ev.returnValue = false

                    const submenu = foundItem.submenu as any[]
                    const item = submenu.find(item => item.id === subId)
                    if (!item) return ev.returnValue = false
                    item.hidden = visible

                    updateContextMenu()
                    ev.returnValue = true
                })

            }
        }
    }
}