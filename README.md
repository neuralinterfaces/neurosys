# Neurosys SDK
The Neurosys software suite provides real-time neurofeedback for multiple EEG + fNIRS devices using a system overlay.

This repository contains the `neurosys` SDK and a fully-functional [Commoners] application for system-level neurofeedback.

### Key Application Features
1. System-level neurofeedback outputs like Brightness, Volume, and Cursor Animation.
2. Support for multiple EEG devices, including the Muse 2 and the HEGduino.
3. System tray integration for a seamless user experience.
4. Modular architecture for easy extension and customization.

## Getting Started

> **Note**: You can use the shortcut `Ctrl + q` to quit the application at any time.

### Connecting a Neurofeedback Device
To connect your device, click on the brain icon in the system tray and select the Connect to Device option from the list.

![Neurosys Device Connection Workflow](./docs/assets/screenshots/DeviceConnection-min.png)

After completing the device connection workflow, you'll be able to configure other settings.

## Changing the Score
The first score option will be chosen automatically. To change the score, click on the brain icon in the system tray and select an alternative Score option from the list.

> **Note**: Currently, there's only one EEG-related score (Alpha Score) and one HEG-related score (HEG Score). More scores will be added in the future.

### Defining your Outputs
To define your outputs, click on the brain icon in the system tray and select any of the available Outputs—as many as you like!

![Neurosys Output Selection](./docs/assets/screenshots/OutputSelection-min.png)

You can save your selection by clicking on the Save Settings tray option.

## Development
Built with [Commoners], Neurosis has a modular architecture that allows for easy extension and customization.

![Neurosys Architecture](./docs/assets/NeurosysArchitecture.png)

## Installation
You will need to have [Node.js](https://nodejs.org/en/) installed on your machine.

This repository uses PNPM for package management. Install PNPM by running the following command:
```bash
npm install -g pnpm
```

Install all dependencies by running the following command:
```bash
pnpm install
```

Finally, build the SDK by running:
```bash
pnpm build:sdk
```

## Running the Application
To run the application, use the following command:
```bash
pnpm start
```

### Plugins
Score and output plugins are automatically detected and loaded into the system tray.

#### Devices 

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
Each **feature** plugin has an `id` field to allow references from other plugins and a `calculate` function that returns the relevant feature data.

The `calculate` function receives an `info` object that includes all data organized by channel name, as well as the current calculation window (`window`) and device sampling frequency(`sfreq`). A `settings` value is also provided, which is provided by the requesting **score** plugin.

```javascript
export default {
    load() {
        return {
            id: 'window',
            calculate( { data, sfreq }, windowDuration = 1) {
                const window = [ -sfreq * windowDuration ] // Calculate using the specified window on the latest data 
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
Each **score** plugin has a `label` field for the tray option names, `features` for feature requirements with related settings, and a `get` function that calculates a score value based on the resolved features.

```javascript
export default {
    load: () => ({
        label: 'Average Voltage',
        features: { window: 1 }, // Request the 1s window feature
        get({ window }) {

            const averagePerChannel = Object.entries(window).reduce((acc, [ch, chData]) => ({ ...acc, [ch]: chData.reduce((acc, val) => acc + val, 0) / chData.length }), {})

            return Object.values(averagePerChannel).reduce((acc, val) => acc + val, 0) / Object.values(averagePerChannel).length
        }
    })
}
```

Once calculated, scores are auto-normalized using baseline data and min/max values detected during the session.

#### Outputs
Each **output** plugin has a `label` field for the tray option name and a `set` function that consumes a score value.

Use the `start` and `stop` fields to specify reactions to being enabled / disabled, including the management of visualization.

```javascript
export default {
    load() {
        return {
            label: 'Print in Main Process',
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

### Common Issues
#### Native Node Modules
It's likely that `robot.js` (if included) will give you trouble when being used through Electron. To solve this, you can try the following:
```
npm rebuild.js
```

This will rebuild the necessary modules for your current operating system.


[Commoners]: https://github.com/neuralinterfaces/commoners