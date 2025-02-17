import { bandpower as calculateBandPower } from "../../../../timefreak/src"

type BandSpecification = Record<string, [ number, number ]>

type Data = Record<string, number[]>
type Window = [number, number]
type SamplingRate = number

type CalculationProperties = {
    data: Data
    window: Window
    sfreq: SamplingRate
}

type Settings = {
    bands: BandSpecification
    windowDuration: number
}


export default {
    load() {
        return {
            id: 'bands',

            calculate(
                { data, sfreq }: CalculationProperties,
                settings: Settings = { bands: {}, windowDuration: 1 }
            ) {

                const { bands, windowDuration } = settings

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

                        acc[ch] = Object.keys(settings).reduce((acc, identifier, idx) => {
                            acc[identifier] = powers[idx]
                            return acc
                        }, {})

                        return acc

                    }, {})
                }
                catch (err) {
                    console.error(err)
                    return {}
                }

            }
        }
    }
}
