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
            feedback: { label: 'Inspect Features' },
            start() {
                const featuresDiv = document.createElement("div")
                featuresDiv.style.position = "absolute"
                featuresDiv.style.top = "40px";
                featuresDiv.style.left = "10px";
                featuresDiv.style.display = "flex";
                featuresDiv.style.flexDirection = "column";
                featuresDiv.style.gap = "10px";
                featuresDiv.style.padding = "10px";

                const bands = createBandpowerVisualization([ "alpha", "beta" ])
                const { parent } = bands
                featuresDiv.append(parent)

                document.body.append(featuresDiv)
                return { elements: { bands } }
            },
            stop({ elements }) {
                for (const value of Object.values(elements)) value.parent.remove()
            },
            set(score, info) {
                const { elements } = info
                const { bands } = this.__features
                if (bands) {

                    const bandElements = elements.bands

                    for (const ch in bands) {
                        const data = bands[ch]
                        for (const band in data) {
                            const value = data[band]
                            const el = bandElements.bands[ch][band]
                            el.style.width = `${value * 100}%`
                        }
                    }
                }
            }
        }
    }
}