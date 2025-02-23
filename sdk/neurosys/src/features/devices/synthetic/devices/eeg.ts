import { generateSignal } from "../../../../../../timefreak/src"
import { Device } from "../../../../core/plugins"

const channelNames = [ 'Fp1', 'Fp2', 'AUX1' ]
const sfreq = 100

const updateFrequency = 10

export default new Device({
    name: "Synthetic EEG",
    type: "EEG",
    protocols: {
        generate: "Generate",
        load: { label: "Load File", enabled: false }
    },
    connect: ({ data }) => {

        const componentOne = { freq: 10, amp: 10 }
        const componentTwo = { freq: 20, amp: 10 }

        const generatedData = (chNames, components, sfreq, duration) => chNames.map(() => generateSignal(components.map(({ amp }) => amp), components.map(({ freq }) => freq), sfreq, duration ))

        const updateDuration = 1000 / sfreq
        

        const getScore = () => (Math.sin(Date.now() / 1000) + 1) / 2

        const interval = setInterval(() => {

            const score = getScore()

            const interpComponentOne = { ...componentOne, amp: componentOne.amp * (1 - score) }
            const interpComponentTwo = { ...componentTwo, amp: componentTwo.amp * score }
            const components = [ interpComponentOne, interpComponentTwo ]

            const durationToGenerate = (updateDuration / 1000) * updateFrequency
            const generated = generatedData(channelNames, components, sfreq, durationToGenerate)

            for (const [ i, samples ] of generated.entries()) {
                const chName = channelNames[i]
                const signal = data[chName] || ( data[chName] = [])
                signal.push(...samples)
            }

        }, updateFrequency);

        return {
            sfreq,
            disconnect: () => clearInterval(interval)
        }
    }
})
