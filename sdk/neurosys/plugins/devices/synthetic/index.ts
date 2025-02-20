import { Devices } from "../../../core/src/plugins"
import syntheticEEG from "./devices/eeg"



export default {
    load() {
        return new Devices([ syntheticEEG ])
    }
}
