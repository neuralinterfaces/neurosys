import { Feature } from "../../../../sdk/neurosys/src/core/plugins"

export default new Feature({
    id: 'window',
    duration: 1, // Automatically window the data by 1s
    calculate({ data }) { return data }
})