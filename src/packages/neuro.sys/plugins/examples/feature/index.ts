export default {
    load() {

        const { PROD } = commoners
        if (PROD) return

        return {
            feature: { label: 'Current Window' },
            calculate( { data, window, sfreq }, requesters) {
                return Object.entries(data).reduce((acc, [ch, chData]) => {
                    const sliced = chData.slice(...window)
                    return { ...acc, [ch]: sliced }
                }, {})
            }
        }
    }
}