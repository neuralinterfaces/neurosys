const createBandElement = (band) => {
    const element = document.createElement('div')
    element.className = `band ${band}`
    return element
}

const createChannelElement = (name) => {
    const channel = document.createElement('div')
    channel.id = name
    channel.classList.add('channel')

    const header = document.createElement('strong')
    header.innerText = name

    const bands = document.createElement('div')
    bands.classList.add('bands')
    channel.append(header, bands)

    return { channel, bands }
}

// const createBandElements = (bands) => bands.reduce((acc, band) => ({ ...acc, [band]: createBandElement(band) }), {})

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

                const channelsContainer = document.createElement('div')
                channelsContainer.id = 'channels-container'
                featuresDiv.append(channelsContainer)
                document.body.append(featuresDiv)

                // const bands = createBandpowerVisualization([ "alpha", "beta" ])

                const getBandElement = (ch, band) => {
                    // Get ch element with query selctor, add if not present
                    let chBandsElement = document.querySelector(`#${ch} .bands`)
                    if (!chBandsElement) {
                        const { channel, bands } = createChannelElement(ch)
                        channelsContainer.append(channel) 
                        chBandsElement = bands
                    }

                    let bandElement = chBandsElement.querySelector(`.band.${band}`)
                    if (!bandElement) {
                        bandElement = createBandElement(band)
                        chBandsElement.append(bandElement)
                    }

                    return bandElement

                }
                
                return { 
                    container: featuresDiv,
                    getBandElement
                }
            },
            stop({ container }) {
                container.remove()
            },
            set(score, info) {
                const { getBandElement } = info
                const { bands } = this.__features
                if (bands) {

                    for (const ch in bands) {
                        const data = bands[ch]
                        for (const band in data) {
                            const value = data[band]
                            const el = getBandElement(ch, band)
                            el.style.width = `${value * 100}%`
                        }
                    }
                }
            }
        }
    }
}