import * as bluetoothPlugin from './src/plugins/ble/index'

// const SHOW = true
const SHOW = false

const ELECTRON_WINDOW_SETTINGS = {
    frame: false,
    transparent: true,
    focusable: false,
    hasShadow: false,
    thickFrame: false, // Windows
    roundedCorners: false // MacOS
}

export default {
    name: "System Neurofeedback",

    pages: {
        settings: './src/pages/settings/settings.html'
    },

    electron: {
        window: SHOW ? {} : ELECTRON_WINDOW_SETTINGS,
        // win: { requestedExecutionLevel: 'requireAdministrator' }
    },

    services: {
        systemService: "./src/services/systemService.ts",
    },

    plugins: {

        bluetooth: bluetoothPlugin,

        levels: {
            load: function () {

                return {
                    setMouseNoise: (level) => this.send("robot.mouseNoise", level)
                }

            },

            desktop: {
                load: async function() {

                    return // Mouse movement is disabled

                    let mouseNoise = 0
                    const MAX_RADIAL_DISPLACEMENT = 10

                    // Move the mouse across the screen as a sine wave.
                    const robot = require('robotjs');

                    // Track the displacement so that the mouse is always centered around a user-defined point
                    const animationFunction = () => {
        
                        const { x: currentX, y: currentY } = robot.getMousePos()

                        const radialDisplacement = mouseNoise * MAX_RADIAL_DISPLACEMENT
                        const angularDisplacement = Math.random() * Math.PI * 2

                        const xDisp = radialDisplacement * Math.cos(angularDisplacement)
                        const yDisp = radialDisplacement * Math.sin(angularDisplacement)

                        const x = currentX + xDisp
                        const y = currentY + yDisp

                        robot.moveMouse(x, y);
                        setTimeout(animationFunction, 1000 / 60);
                    }

                    // Start the animation
                    animationFunction()
    
                    // Allow for the noise level to be set from the main thread
                    this.on("robot.mouseNoise", (event, level) => mouseNoise = level)

                }
            }
        },

        systemService: {
            load: function () {
                const { SERVICES: { systemService : { url }} } = commoners
                
                return {
                    get: async (path) => {
                        const endpoint = new URL(path, url)
                        const result = await fetch(endpoint.href)
                        const json = await result.json()
                        return json
                    },
                    post: async (path, body) => {
                        const endpoint = new URL(path, url)
                        const result = await fetch(endpoint.href, { method: 'POST', body: JSON.stringify(body) })
                        const json = await result.json()
                        return json
                    }
                }
            }
        },


        menu: {
            assets: {
                macTrayIcon: "./src/tray/macIcon.png",
                trayIcon: "./src/tray/trayIcon.png"
            },

            load: function () {
                return {
                    onAnimationToggled: (callback) => this.on("toggle-animation", () => callback()),
                    showDeviceSelector: (callback) => this.on("devices.show", () => callback())
                }
            },

            desktop: {
                load: function () {

                    const { plugin: { assets: { trayIcon, macTrayIcon } }, electron, utils: { platform: { isMacOS }} } = this

                    const { Menu, BrowserWindow, Tray } = electron

                    const menu = Menu.buildFromTemplate([

                        {
                            label: 'Connect to Device',
                            click: () =>  this.send("devices.show")
                        },

                        { type: 'separator' },

                        {
                          label: 'Options',
                          submenu: [
                            { label: 'Toggle Animation', click: () => this.send("toggle-animation") }
                          ],
                        },

                        { label: 'Quit', role: 'quit' }
                      ]);
                    
                    //   Menu.setApplicationMenu(menu);

                    const tray = new Tray(isMacOS ? macTrayIcon : trayIcon);

                    tray.setContextMenu(menu);
                    tray.setToolTip('System Neurofeedback');

                    tray.on('click', () => tray.popUpContextMenu()); // On Windows, it's ideal to open something from the app here...
                }
            }
        },


        transparent: {
            load: function () {
                return {
                    setIgnoreMouseEvents: (ignore) => this.send("set-ignore-mouse-events", ignore)
                }
            },
            desktop: {
                load: function (win) {

                    if (SHOW) return

                    const mainScreen = this.electron.screen.getPrimaryDisplay()

                    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
                    win.setAlwaysOnTop(true, 'screen-saver', 1)
                    win.setFullScreenable(false);
                    win.setResizable(false); // Ensure over the dock on MacOS
                    win.moveTop();
                    
                    win.setPosition(mainScreen.bounds.x, mainScreen.bounds.y)
                    win.setSize(mainScreen.bounds.width, mainScreen.bounds.height)

                    // Ensure the window cannot be interacted with unless exceptions are specified
                    win.setIgnoreMouseEvents(true, { forward: true });
                    this.on("set-ignore-mouse-events", (event, ignore) => win.setIgnoreMouseEvents(ignore, { forward: true }));

                    // Ensure you can always exit the app
                    this.electron.globalShortcut.register('CommandOrControl+Q', () =>  this.electron.app.quit())

                    // win.webContents.openDevTools()
                },
            },
        }
    }
}