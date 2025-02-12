import { channelNames } from "muse-js"

const createBandpowerVisualization = (bands) => {
    const channelsContainer = document.createElement('div')
    channelsContainer.id = 'channels-container'

    const bandElementsByChannel = channelNames.reduce((acc, name) => {
        const channelElement = document.createElement('div')
        channelElement.id = name
        channelElement.classList.add('channel')

        const bandElements = bands.reduce((acc, band) => {
            const bandElement = document.createElement('div')
            bandElement.id = `${name}-${band}`
            bandElement.className = `band ${band}`
            acc[band] = bandElement
            return acc
        }, {})

        const header = document.createElement('strong')
        header.innerText = name

        const bandsContainer = document.createElement('div')
        bandsContainer.classList.add('bands')
        bandsContainer.append(...Object.values(bandElements))
        channelElement.append(header, bandsContainer)

        channelsContainer.appendChild(channelElement)

        acc[name] = bandElements

        return acc

    }, {})

    return {
        parent: channelsContainer,
        bands: bandElementsByChannel
    }
}



export default {
    load() {
        return {
            feedback: { label: 'Bandpower Visualiation' },
            start() {
                const elements = createBandpowerVisualization([ "alpha", "beta" ])
                const { parent } = elements
                document.body.append(parent)
                return { elements }
            },
            stop({ elements }) {
                elements.parent.remove()
            },
            set: ({ score, features, info }) => {
                const { elements } = info
                const { bands } = features
                if (bands) {
                    for (const ch in bands) {
                        const data = bands[ch]
                        for (const band in data) {
                            const value = data[band]
                            const el = elements.bands[ch][band]
                            el.style.width = `${value * 100}%`
                        }
                    }
                }
            }
        }
    }
}