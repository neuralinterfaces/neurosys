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



export default {
    load() {
        return {
            feature: { label: 'Bandpowers' },

            settings: {
                windowInSeconds: 1
            },

            calculate(
                { data, sfreq }: CalculationProperties,
                requesters: BandSpecification[]
            ) {

                const allBands = requesters.reduce((acc, val) => acc = { ...acc, ...val } , {})
                const window = [ -sfreq * this.settings.windowInSeconds ]

                try {
                    return Object.entries(data).reduce((acc, [ch, chData]) => {

                        const sliced = chData.slice(...window)
                        const powers = calculateBandPower(
                            sliced,
                            sfreq,
                            Object.values(allBands),
                            { relative: true }
                        )

                        acc[ch] = Object.keys(allBands).reduce((acc, identifier, idx) => {
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
