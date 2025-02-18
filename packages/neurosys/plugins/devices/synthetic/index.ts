import * as syntheticEEG from "./devices/eeg"



export default {
    load() {
        return {
            devices: [ syntheticEEG ]
        }
    }
}
