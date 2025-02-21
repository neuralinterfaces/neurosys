import { Devices } from "../../../core/plugins"
import syntheticEEG from "./devices/eeg"

export function load() {
    return new Devices([ syntheticEEG ])
}