// ----------- Bands -------------
//     delta: [1, 3],
//     theta: [4, 7],
//     alpha: [8, 12],
//     beta: [13, 30],
//     gamma: [31, 50]

import { Score } from "../../../core/src/plugins"

export function load() {

    return new Score({
        label: 'Alpha Score',
        features: {
            bands: { 
                bands: { alpha: [ 8, 12 ] },
                 windowDuration: 1 
            }
        },
        get({ bands = {} }) {
            return Object.values(bands).reduce((acc, { alpha }) => acc + alpha, 0) / Object.keys(bands).length
        }
    })
}