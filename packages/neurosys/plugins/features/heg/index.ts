
export default {
    load() {
        return {
            id: 'HEG',
            devices: [ 'HEG' ],
            calculate({ data, window }) {

                const averaged =  Object.entries(data).reduce((acc, [ch, chData]) => {
                    const sliced = chData.slice(...window)
                    const average = sliced.reduce((acc, val) => acc + val, 0) / sliced.length
                    acc[ch] = average
                    return acc
                }, {})

                return averaged['red'] / averaged['ir']
            }
        }
    }
}
