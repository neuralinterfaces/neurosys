// ----------- Bands -------------
//     delta: [1, 3],
//     theta: [4, 7],
//     alpha: [8, 12],
//     beta: [13, 30],
//     gamma: [31, 50]

import { Evaluate } from "../../../core/plugins"

export default new Evaluate({
    label: 'Alpha Score',
    features: {
        bands: { 
            bands: { 
                alpha: [ 8, 12 ] 
            },
             windowDuration: 1  // Custom duration setting
        }
    },
    get({ bands = {} }) {
        return Object.values(bands).reduce((acc, { alpha }) => acc + alpha.value, 0) / Object.keys(bands).length // Get average total bandoower
    }
})