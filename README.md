# Neurosys SDK
`neurosys` is a software development kit for creating neurofeedback applications that support multiple devices (EEG, fNIRS, HEG, etc.) and provide system-level neurofeedback.

### Why It Matters
Most neurofeedback systems ask you to interrupt your routine for a dedicated session—but **the Neurosys SDK seeks to meet people where they’re at**. 

Applications built on `neurosys` allow you to leverage your daily activities for neurofeedback, making it easier to integrate into your life.

### Key Features
1. **System-level Neurofeedback Outputs:** Brightness, Volume, and Cursor Animation.
2. **Multi-Device Support:** Compatible with most biofeedback devices, with initial support for the Muse 2 and the HEGduino.
3. **System Tray Integration:** Easily connect and disconnect devices, change evaluation metrics, and select outputs without leaving your current task.
4. **Modular Architecture:** Easily extend and customize the system with new devices, features, evaluations, and outputs.

### Applications
- **[Neurosys Starter Kit](https://github.com/neuralinterfaces/neurosys-starter-kit)**: A template application for providing system-level neurofeedback.
- **[HEGBeta](https://github.com/garrettmflynn/HEGBeta)**: An HEGduino-focused release for training your HEG ratio.

## Getting Started
The Neurosys SDK has a modular architecture that allows for easy extension and customization.

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

## Plugin Design

### Devices 
Each **devices** plugin has:
1. A `devices` array, where each item has a `name`
2. A dictionary of `protocols`
3. A `connect` function that starts the data stream, uses the provided `notify` function to update the application with new data, and returns metadata about the structure of returned data
4. A `disconnect` function that stops the data stream.

```javascript
import { Devices, Device } from 'neurosys/plugins'

export const devices = new Devices([
       new Device({
        name: 'Random Data',
        protocols: { start: "Start" },
        disconnect() {
            clearInterval(this.__interval)
        },
        connect( { protocol }, notify ) {

            const montage = [ 'Fp1', 'Fp2' ]
            const sfreq = 512

            // Genereate data every 1/sfreq seconds
            const interval = setInterval(() => {
                const data = montage.reduce((acc, ch) => ({ ...acc, [ch]: [ Math.random() * 100 ] }), {})
                notify({ data, timestamps: [ performance.now() ] }, 'eeg') // Route to the correct data collection
            }, 1000 / sfreq)

            this.__interval = interval  // Set the interval reference in the device context

            return { eeg: { sfreq } } // Annotate with data collection
        }
    })
])
```

### Features
Each **feature** plugin has an `id` field to allow references from other plugins, a `duration` (optional) in seconds that controls the amount of data received, and a `calculate` function that returns the relevant feature data.

The `calculate` function receives an `info` object that includes all data organized by channel name, which has been windowed by the `duration` value. A `settings` value is also provided, which is provided by the requesting **evaluation** plugin.

```javascript
import { Feature } from 'neurosys/plugins'

export const windowData = new Feature({
    id: 'window', // Unique identifier for the feature to be requested
    duration: 1, // Automatically window the data by 1s
    calculate({ data }, settings) { return data }
})
```

See the [Evaluation](#evaluation) section for an example of how to request this feature.

### Evaluation
Each **evaluation** plugin has a `label` field for the tray option names, `features` for feature requirements with related settings, and a `get` function that resolves a meaningful metric based on the resolved features.

```javascript
import { Evaluate } from 'neurosys/plugins'

export const averageVoltage = Evaluate({
    label: 'Average Voltage',
    features: { window: true },
    get({ window: windowedData }) {

        const averagePerChannel = Object.entries(windowedData).reduce((acc, [ch, chData]) => ({ ...acc, [ch]: chData.reduce((acc, val) => acc + val, 0) / chData.length }), {})

        return Object.values(averagePerChannel).reduce((acc, val) => acc + val, 0) / Object.values(averagePerChannel).length
    }
})
```

Evaluated metrics are auto-normalized into a **score** using baseline data and min/max values detected during the session.

### Outputs
Each **output** plugin has a `label` field for the tray option name and a `set` function that consumes calculated features that are pre-populated with a `score` value and a `__score` metadata object.

Use the `start` and `stop` fields to specify reactions to being enabled / disabled, including the management of visualization.

```javascript
import { Output } from 'neurosys/plugins'

export const printOutput = new Output({
    label: 'Print',
    start() {
        const { cache = 0 } = this
        const counter = cache + 1
        console.log('Plugin activated', counter)
        this.counter = counter
    },
    stop() {
        console.log('Plugin deactivated')
        this.cache = this.counter
    },
    set(features){
        console.log(`Features (${this.counter})`, features)
    }
})
```

### Commoners-Based Electron Support 
To add Electron support for your plugin through Commoners, you can attach the `desktop` Commoners field to your plugin.

Below is an example using an **Output** plugin.

```javascript
import { Output } from 'neurosys/plugins'

const printInMainProcess = new Output({
    label: 'Print — Main Process',
    set (features) {
        this.commoners.send("features", features) 
    }
})

// Hijack the desktop methods
printInMainProcess.desktop = {
    load() { 
        this.on("features", (_, features) => console.log("Features:", features) ) 
    }
}
```

### Server-Side Plugins
You can declare server-side plugins (SSPs) and expose them using a standardized REST API.

#### SDK
`neurosys/services` provides a set of utilities for creating server-side plugins, which can be used as follows:

```javascript
import { Output } from 'neurosys/plugins';
import { createService } from 'neurosys/services';

import * as examples from './examples'; // A collection of the plugins defined above

const host = process.env.HOST || "localhost";
const port = process.env.PORT

const print = new Output({
    label: "Print (SSP)",
    set: ({ score }) => console.log("Score", score)
});

const server = createService({ 
    device: examples.devices, // NOTE: Not yet supported
    feature: examples.windowData,
    evaluation: examples.averageVoltage,
    output: examples.printOutput
 });

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
```

#### REST API

All `GET` requests to the `.neurosys` sub-route return a collection of available plugins.

##### Response Structure
```json
{
    "success": true,
    "result": {
        "print": {
            "info": {
                "label": "Print — Example SSP",
                "settings": {},
                "start": null,
                "stop": null,
                "set": "[Function: set]"
            },
            "type": "output"
        }
    }
}
```

##### Error Structure
```json
{ "success": false, "error": "Error message" }
```

`POST` requests the `.neurosys` sub-route are handled to reference `<type>/<name>/<method>`, receiving the necessary data for that plugin. 

##### Response Structure 
```json
{ "success": true, "result": {} }
```

##### Error Structure
```json
{ "success": false, "error": "Error message" }
```