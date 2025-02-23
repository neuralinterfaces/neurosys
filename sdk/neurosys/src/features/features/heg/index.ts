import { Feature } from "../../../core/plugins"

export function load() {
    return new Feature({
        id: 'HEG',
        devices: [ 'HEG' ],
        calculate({ data }) {

            const averaged =  Object.entries(data).reduce((acc, [ch, chData]) => {
                const average = chData.reduce((acc, val) => acc + val, 0) / chData.length
                acc[ch] = average
                return acc
            }, {}) as Record<string, number>

            return averaged['red'] / averaged['ir']
        }
    })
}