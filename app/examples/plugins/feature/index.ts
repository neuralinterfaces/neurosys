import { Feature } from "../../../../sdk/neurosys/src/core/plugins"

export default {
    load() {

        const { PROD } = commoners
        if (PROD) return

        return new Feature({
            id: 'window',
            duration: 1,
            calculate( { data, sfreq }) {
                const window = [ -sfreq * duration ] // Calculate using the specified window on the latest data 
                return Object.entries(data).reduce((acc, [ch, chData]) => {
                    const sliced = chData.slice(...window)
                    return { ...acc, [ch]: sliced }
                }, {})
            }
        })
    }
}