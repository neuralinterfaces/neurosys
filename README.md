# neuro.sys
This application modifies the brightness of a computer screen based on the user's brainwaves.

## Installation
1. Install [Node.js](https://nodejs.org/en/download/)
2. Clone this repository    
3. Run `npm install --force` in the root directory of the repository

## Usage
Run `npm start` in the root directory of the repository

### Connecting a Device
To connect a device, click on the brain icon in the system tray and select the Connect to Device option from the list.

Beware that you might get stuck with your brightness very low! To force the application to close, use the `Ctrl + q` shortcut.

## Development
This application is built with [commmoners](https://github.com/neuralinterfaces/commoners), allowing for a modular and extensible architecture.

### Plugins
Score and feedback plugins are automatically detected and loaded into the system tray.

#### Score Design
Score plugins have special `load` fields, including `score` for tray details and a `get` function that returns a score value.

```javascript
export default {
    load: () => ({
        score: { label: 'Sine Wave' },
        get: () => (Math.sin(Date.now() / 1000) + 1) / 2,
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
            set: ({ score, features, info }) => this.send("score", score) 
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
- Properly handle cancelled BLE request
- Baseline your features with the first 5s + allow Reset Baseline
- Integrate with Spotify for volume control
    - Add login with spotify option 
    - Use refresh token…
- Integrate Brainflow robustly
- Test Linux
- Create multiple windows for different screens in a multi-monitor setup

### Issues
- Every once in a while, the brightness stops responding...

## Extensions
### robot.js
This feature has been commented out in the `commoners.config.ts` file.
- [rebuild.js](./rebuild.js) is used to build the correct version of robot.js for Electron