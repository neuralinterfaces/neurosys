import { Feature } from "../../../core/src/plugins"

export default {
    load() {
        return new Feature({
            id: 'HEG',
            devices: [ 'HEG' ],
            calculate({ data }, { windowDuration = 1 }) {

                const window = [ -windowDuration ]

                const averaged =  Object.entries(data).reduce((acc, [ch, chData]) => {
                    const sliced = chData.slice(...window)
                    const average = sliced.reduce((acc, val) => acc + val, 0) / sliced.length
                    acc[ch] = average
                    return acc
                }, {}) as Record<string, number>

                return averaged['red'] / averaged['ir']
            }
        })
    }
}
