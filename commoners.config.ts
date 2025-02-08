
export default {
    name: "System Neurofeedback",

    electron: {
        window: {
            frame: false, 
            transparent: true,
            focusable: false,
            hasShadow: false,
        },
        // win: { requestedExecutionLevel: 'requireAdministrator' }
    },

    services: {
        systemService: "./src/services/systemService.ts",
    },

    plugins: {

        levels: {
            load: function () {

                return {
                    setMouseNoise: (level) => this.send("robot.mouseNoise", level)
                }

            },

            desktop: {
                load: async function() {

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


        transparent: {
            load: function () {
                return {
                    setIgnoreMouseEvents: (ignore) => this.send("set-ignore-mouse-events", ignore)
                }
            },
            desktop: {
                load: function (win) {
                    const mainScreen = this.electron.screen.getPrimaryDisplay()
                    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
                    win.setAlwaysOnTop(true, 'screen-saver', 1)
                    
                    win.setIgnoreMouseEvents(true, { forward: true });
                    
                    win.setPosition(mainScreen.bounds.x, mainScreen.bounds.y)
                    win.setSize(mainScreen.bounds.width, mainScreen.bounds.height)

                    this.on("set-ignore-mouse-events", (event, ignore) => win.setIgnoreMouseEvents(ignore, { forward: true }));

                    // Ensure you can always exit the app
                    this.electron.globalShortcut.register('CommandOrControl+Q', () =>  this.electron.app.quit())

                    // win.webContents.openDevTools()
                },
            },
        }
    }
}