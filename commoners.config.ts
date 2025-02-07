
const hasFrame = false;

export default {
    name: "System Neurofeedback",

    electron: {
        window: {
            frame: false, 
            transparent: true,
            focusable: false,
            hasShadow: false,
        },
    },

    services: {
        systemService: "./src/services/systemService.ts",
    },

    plugins: {
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
                },
            },
        }
    }
}