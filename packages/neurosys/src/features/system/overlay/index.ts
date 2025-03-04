const windowOverrides = {
        frame: false,
        transparent: true,
        focusable: false,
        hasShadow: false,
        thickFrame: false, // Windows
        roundedCorners: false // MacOS
}

export default ({ debug = false } = {}) => {
    return {
        load() {
            return {
                setIgnoreMouseEvents: (ignore) => this.send("set-ignore-mouse-events", ignore)
            }
        },

        desktop: {
            mainWindowOverrides: debug ? {} : windowOverrides,
            load: function (win) {

                if (debug) return

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
                this.electron.globalShortcut.register('CommandOrControl+Q', () => this.electron.app.quit())
            }
        }
    }
}