# Neurosys 🌀
> Neurofeedback for the Rest of Us

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

### Devices 

<!-- export const name = 'Synthetic EEG'

export const category = 'EEG'

export const protocols = {
    generate: "Generate",
    load: { label: "Load File", enabled: false }
}

const channelNames = [ 'Fp1', 'Fp2', 'C3', 'C4', 'O1', 'O2', 'AUX1', 'AUX2' ]
const sfreq = 512

export const connect = async ({ data }) => { -->

Each **device** plugin has a `devices` array, where each item has a `name`, a dictionary of `protocols`, and a `connect` function that starts the data stream and provides metadata about the device.

```javascript
export default {
    load() {
        return {
            devices: [ {
                name: 'Random Data',
                protocols: { start: "Start" },
                connect: ({ data, protocol }) => {

                    const sfreq = 512
                    const channels = [ 'Fp1', 'Fp2' ]
                    const interval = setInterval(() => {

                        channels.forEach((ch) => {
                            const arr = data[ch] || (data[ch] = [])
                            arr.push(Math.random() * 100)
                        })

                    }, 1000 / sfreq)

                    return {
                        disconnect: () => clearInterval(interval),
                        sfreq,
                    }

                }
            } ]
        }
    }
}
```

#### Features
Each **feature** plugin has a `features` field with metadata and a `calculate` function that returns the relevant feature data.

The `calculate` function receives an `info` object that includes all data organized by channel name, as well as the current calculation window (`window`) and device sampling frequency(`sfreq`). A `requesters` array is also provided, which lists any settings provided for requesting **score** plugins.

```javascript
export default {
    load() {
        return {
            feature: { label: 'Current Window' },
            calculate( { data, window, sfreq }, requesters) {
                return Object.entries(data).reduce((acc, [ch, chData]) => {
                    const sliced = chData.slice(...window)
                    return { ...acc, [ch]: sliced }
                }, {})
            }
        }
    }
}
```

This will be later referenced by the key used in the `commoners.config.ts` file.

```javascript
export default {
    plugins: { window: windowFeaturePlugin }
}
```

See the [Scores](#score) section for an example of how to request this feature.

#### Score
Each **score** plugin has special `load` fields, including `score` for tray details, `features` for feature requirements, and a `get` function that calculates a score value based on the resolved features.

```javascript
export default {
    load: () => ({
        score: { label: 'Average Voltage' },
        features: { window: true },
        get({ window }) {

            const averagePerChannel = Object.entries(window).reduce((acc, [ch, chData]) => ({ ...acc, [ch]: chData.reduce((acc, val) => acc + val, 0) / chData.length }), {})

            const average = Object.values(averagePerChannel).reduce((acc, val) => acc + val, 0) / Object.values(averagePerChannel).length


            // Normalize the voltage by storing historical min and max values
            this.min = this.min ? Math.min(this.min, average) : average
            this.max = this.max ? Math.max(this.max, average) : average
            return Math.max(0, Math.min(1, (average - this.min) / (this.max - this.min)))
        }
    })
}
```

#### Feedback
Each **feedback** plugin has a `feedback` field specifying the tray details and a `set` function that consumes a score value.

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
- Baseline your features with the first 5s + allow Reset Baseline
- Integrate Brainflow
- Create multiple windows for different screens in a multi-monitor setup
- Test Linux

## Extensions
### robot.js
This feature has been commented out in the `commoners.config.ts` file.
- [rebuild.js](./rebuild.js) is used to build the correct version of robot.js for Electron
