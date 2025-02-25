import { Feature } from "../../../../sdk/neurosys/src/core/plugins"

export default new Feature({
    id: 'window', // Unique identifier for the feature to be requested
    duration: 1, // Automatically window the data by 1s
    calculate({ data }, settings) { return data }
})