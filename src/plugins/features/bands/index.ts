import { bandpower as calculateBandPower } from './bcijs/bandpower'


type BandSpecification = string[]

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
            calculate(
                { data, window, sfreq }: CalculationProperties,
                requesterSettings: BandSpecification
            ) {
                

                return Object.entries(data).reduce((acc, [ch, chData]) => {

                    const sliced = chData.slice(...window)

                    const powers = calculateBandPower(
                        sliced,
                        sfreq,
                        requesterSettings,
                        { relative: true }
                    )

                    acc[ch] = requesterSettings.reduce((acc, band, idx) => {
                        acc[band] = powers[idx]
                        return acc
                    }, {})

                    return acc

                }, {})

            }
        }
    }
}
