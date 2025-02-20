import { Devices } from "../../../core/plugins"
import syntheticEEG from "./devices/eeg"



export default {
    load() {
        return new Devices([ syntheticEEG ])
    }
}
