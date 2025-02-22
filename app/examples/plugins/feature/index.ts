import { Feature } from "../../../../sdk/neurosys/src/core/plugins"

export default {
    load() {

        const { PROD } = commoners
        if (PROD) return

        return new Feature({
            id: 'window',
            calculate( { data, sfreq }, windowDuration = 1) {
                const window = [ -sfreq * windowDuration ] // Calculate using the specified window on the latest data 
                return Object.entries(data).reduce((acc, [ch, chData]) => {
                    const sliced = chData.slice(...window)
                    return { ...acc, [ch]: sliced }
                }, {})
            }
        })
    }
}