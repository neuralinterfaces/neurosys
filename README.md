# Neurosys SDK

The Neurosys software suite provides real-time neurofeedback for multiple EEG + fNIRS devices using a system overlay.

This repository contains the `neurosys` SDK and a fully-functional [Commoners] application for system-level neurofeedback.

### Why It Matters
Neurosys intends to meet people where they’re at. Most neurofeedback systems ask you to interrupt your routine for a dedicated session. We allow you to leverage your daily activities for neurofeedback, making it easier to integrate into your life.

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
Each **devices** plugin has a `devices` array, where each item has a `name`, a dictionary of `protocols`, and a `connect` function that starts the data stream and provides metadata about the device.

```javascript
import { Devices, Device } from 'neurosys/plugins'

export default new Devices([
    new Device({
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
    })
])
```

#### Features
Each **feature** plugin has an `id` field to allow references from other plugins, a `duration` (optional) in seconds that controls the amount of data received, and a `calculate` function that returns the relevant feature data.

The `calculate` function receives an `info` object that includes all data organized by channel name, which has been windowed by the `duration` value. A `settings` value is also provided, which is provided by the requesting **score** plugin.

```javascript
import { Feature } from 'neurosys/plugins'

export default new Feature({
    id: 'window',
    duration: 1, // Automatically window the data by 1s
    calculate({ data }, settings) { return data }
})
```

This will be later referenced by the key used in the `commoners.config.ts` file (e.g. `window`).

```javascript
export default {
    plugins: { window: windowFeaturePlugin }
}
```

See the [Scores](#score) section for an example of how to request this feature.

#### Score
Each **score** plugin has a `label` field for the tray option names, `features` for feature requirements with related settings, and a `get` function that calculates a score value based on the resolved features.

```javascript
import { Score } from 'neurosys/plugins'

export default Score({
    label: 'Average Voltage',
    get({ window }) {

        const averagePerChannel = Object.entries(window).reduce((acc, [ch, chData]) => ({ ...acc, [ch]: chData.reduce((acc, val) => acc + val, 0) / chData.length }), {})

        return Object.values(averagePerChannel).reduce((acc, val) => acc + val, 0) / Object.values(averagePerChannel).length
    }
})
```

Once calculated, scores are auto-normalized using baseline data and min/max values detected during the session.

#### Outputs
Each **output** plugin has a `label` field for the tray option name and a `set` function that consumes a score value.

Use the `start` and `stop` fields to specify reactions to being enabled / disabled, including the management of visualization.

```javascript
import { Output } from 'neurosys/plugins'

export default new Output({
    label: 'Print',
    start({ cache = 0 }) {
        const counter = cache + 1
        console.log('Plugin activated', counter)
        return { counter }
    },
    stop({ counter }) {
        console.log('Plugin deactivated')
        return { cache: counter }
    },
    set: ({ score }, info) => console.log(`Score (${info.counter})`, score)
})
```

#### Commoners-Based Electron Support 
To add Electron support for your plugin through Commoners, you can attach the `desktop` Commoners field to your plugin.

Below is an example using an **Output** plugin.

```javascript
import { Output } from 'neurosys/plugins'

const printInMainProcess = new Output({
    label: 'Print — Main Process',
    set ({ score }) {
        this.__commoners.send("score", score) 
    }
})

// Hijack the desktop methods
printInMainProcess.desktop = {
    load() { 
        this.on("score", (_, score) => console.log("Score:", score) ) 
    }
}
```

#### Server-Side Plugins
You can declare server-side plugins (SSPs) and expose them using a standardized REST API.

> **Note:** Currently, Devices SSPs are **not** supported.

##### Neurosys SDK
The Neurosys SDK provides a set of utilities for creating server-side plugins, which can be used as follows:

```javascript
import { createService, registerOutputPlugins, Output } from 'neurosys/services';

const host = process.env.HOST || "localhost";
const port = process.env.PORT

const print = new Output({
    label: "Print — Server-Side Plugin",
    set: ({ score }) => console.log("Score", score)
});

const server = createService({ ...registerOutputPlugins({ print }) });

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
```

##### REST API

All `GET` requests return a collection of available plugins.

```json
{
    "print": {
        "info": {
            "label": "Print — Server-Side Plugin",
            "settings": {},
            "start": null,
            "stop": null,
            "set": "[Function: set]"
        },
        "type": "output"
    }
}
```

`POST` requests are handled to reference `<type>/<name>/<method>`, receiving the necessary data for that plugin. Resonses are structured as follows:

```json
{ "success": true, "result": null } // Success. Result can be anything.
{ "success": false, "error": "Error message" } // Error.
```

### Common Issues
#### Native Node Modules
It's likely that `robot.js` (if included) will give you trouble when being used through Electron. To solve this, you can try the following:
```
npm rebuild.js
```

This will rebuild the necessary modules for your current operating system.


[Commoners]: https://github.com/neuralinterfaces/commoners