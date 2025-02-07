const { DESKTOP, SERVICES } = commoners


export const setBrightness = async (value: number) => {

    if (!DESKTOP) return
    const endpoint = new URL('brightness', SERVICES.systemService.url)
    const result = await fetch(endpoint.href, {
        method: 'POST',
        body: JSON.stringify({ value })
    })

    const json = await result.json()

    return json
}

export const setVolume = async (value: number) => {
    if (!DESKTOP) return
    const endpoint = new URL('volume', SERVICES.systemService.url)
    const result = await fetch(endpoint.href, {
        method: 'POST',
        body: JSON.stringify({ value })
    })

    const json = await result.json()

    return json

}