import { generateSignal } from "../../../../packages/timefreak/src"

export const name = 'Synthetic EEG'

export const category = 'EEG'

export const protocols = {
    generate: "Generate",
    load: { label: "Load File", enabled: false }
}

const channelNames = [ 'Fp1', 'Fp2', 'C3', 'C4', 'O1', 'O2', 'AUX1', 'AUX2' ]
const sfreq = 512

export const connect = async ({ data }) => {

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

        let generated = generatedData(channelNames, components, sfreq, updateDuration)

        for (const [ i, samples ] of generated.entries()) {
            const chName = channelNames[i]
            const signal = data[chName] || ( data[chName] = [])
            signal.push(...samples)
        }

    }, updateDuration);

    return {
        sfreq,
        disconnect: () => clearInterval(interval)
    }
}
