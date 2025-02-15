# Neurosys 🌀
> OS-level Control for BCIs

Neurosys is a desktop application that uses brain-computer interface (BCI) technology to provide system-level feedack on your computer.

## Installation
1. Install [Node.js](https://nodejs.org/en/download/)
2. Clone this repository    
3. Run `npm install --force` in the root directory of the repository

## Usage
Run `npm start` in the root directory of the repository

> **Beware**: If you're ever stuck with an unresponsive screen, use the shortcut `Ctrl + q` to force close the application.

### Connecting a Device
To connect a device, click on the brain icon in the system tray and select the Connect to Device option from the list.

## Development
This application is built with [commmoners](https://github.com/neuralinterfaces/commoners), allowing for a modular and extensible architecture.

### Plugins
Score and feedback plugins are automatically detected and loaded into the system tray.

#### Score Design
Score plugins have special `load` fields, including `score` for tray details, `features` for feature requirements, and a `get` function that calculates a score value based on the resolved features.

The `get` function

```javascript
export default {
    load: () => ({
        score: { label: 'Alpha Score' },
        features: { bands: ['alpha'] },
        get({ bands }) {
            const averageAlphaRatio = Object.values(bands).reduce((acc, { alpha }) => acc + alpha, 0) / Object.keys(bands).length
            return Math.min(1, Math.max(0, averageAlphaRatio))
        }
    })
}
```

#### Feedback Design
Feedback plugins include a `feedback` field specifying the tray details and a `set` function that consumes a score value.

Use the `start` and `stop` fields to specify reactions to being enabled / disabled, including the management of visualization.

```javascript
export default {
    load() {
        return {
            feedback: { label: 'Print in Main Process' },
            start({ cache = 0 }) {
                const counter = cache + 1
                console.log('Plugin activated', counter)
                return { counter }
            },
            stop({ counter }) {
                console.log('Plugin deactivated')
                return { cache: counter }
            },
            set: (score, info) => this.send("score", score) 
        }
    },
    desktop: {
        load() {
            this.on("score", (_, score) => console.log("Score:", score) )
        }
    }
}
```

### Improvements
- Integrate with Spotify for volume control
    - Popup using Electon instead of standard window popup
    - Gracefully handle page refresh
    - Use refresh token…
- Baseline your features with the first 5s + allow Reset Baseline
- Integrate Brainflow robustly
- Test Linux
- Create multiple windows for different screens in a multi-monitor setup

### Issues
- Every once in a while, the brightness stops responding...

## Extensions
### robot.js
This feature has been commented out in the `commoners.config.ts` file.
- [rebuild.js](./rebuild.js) is used to build the correct version of robot.js for Electron