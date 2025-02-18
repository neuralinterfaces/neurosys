import { bandpower as calculateBandPower } from "../../../../timefreak/src"

type BandSpecification = Record<string, [ number, number ]>

type Data = Record<string, number[]>
type SamplingRate = number

type Client = {
    data: Data
    sfreq: SamplingRate
}

type Settings = {
    bands?: BandSpecification
    windowDuration?: number
}


export default {
    load() {
        return {
            id: 'bands',

            calculate(
                { data, sfreq }: Client,
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
