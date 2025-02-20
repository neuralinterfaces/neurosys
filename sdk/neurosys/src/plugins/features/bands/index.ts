import { bandpower as calculateBandPower } from "../../../../../timefreak/src"
import { Feature } from "../../../core/plugins"

type BandSpecification = Record<string, [ number, number ]>

type Settings = {
    bands?: BandSpecification
    windowDuration?: number
}


export default {
    load() {
        return new Feature({
            id: 'bands',
            calculate(
                { data, sfreq },
                settings: Settings
            ) {

                const { bands = {}, windowDuration = 1 } = settings

                const window = [ -sfreq * windowDuration ]
                
                try {
                    return Object.entries(data).reduce((acc, [ch, chData]) => {

                        const sliced = chData.slice(...window)
                        const powers = calculateBandPower(
                            sliced,
                            sfreq,
                            Object.values(bands),
                            { relative: true }
                        )

                        acc[ch] = Object.keys(bands).reduce((acc, identifier, idx) => {
                            acc[identifier] = powers[idx]
                            return acc
                        }, {}) as Record<string, number>

                        return acc

                    }, {})
                }
                catch (err) {
                    console.error(err)
                    return {}
                }
            }
        })
    }
}