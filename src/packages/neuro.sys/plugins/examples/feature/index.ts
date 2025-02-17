export default {
    load() {

        const { PROD } = commoners
        if (PROD) return

        return {
            id: 'window',
            label: 'Current Window',
            calculate( { data, sfreq }, windowDuration = 1) {
                const window = [ -sfreq * windowDuration ] // Calculate using the specified window on the latest data 
                return Object.entries(data).reduce((acc, [ch, chData]) => {
                    const sliced = chData.slice(...window)
                    return { ...acc, [ch]: sliced }
                }, {})
            }
        }
    }
}