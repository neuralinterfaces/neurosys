import { bandpower as calculateBandPower } from "../../../../../timefreak/src"

import { Feature } from "../../../core/plugins"

type BandSpecification = Record<string, [ number, number ]>

type Settings = {
    bands?: BandSpecification
    windowDuration?: number
}


export default new Feature({
    id: 'bands',
    duration: 3, // Max duration for windowing
    calculate(
        { data, sfreq },
        settings: Settings
    ) {

        const { bands = {}, windowDuration } = settings

        const window = typeof windowDuration === 'number' ? [ -sfreq * windowDuration ] : undefined
        
        try {
            return Object.entries(data).reduce((acc, [ch, chData]) => {

                const sliced = window ? chData.slice(...window) : chData
                const { bands: bandsData, total } = calculateBandPower(
                    sliced,
                    sfreq,
                    Object.values(bands)
                )

                acc[ch] = Object.keys(bands).reduce((acc, identifier, idx) => {
                    acc[identifier] = {
                        value: bandsData[idx],
                        total: total
                    }
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