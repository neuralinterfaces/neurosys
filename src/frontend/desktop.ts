const { DESKTOP, READY } = commoners

export const runRobot = async () => {
    const { systemService } = await READY
    const result = await systemService.get('robot')
    return result
}


export const setBrightness = async (value: number) => {

    if (!DESKTOP) return

    const { systemService } = await READY
    const result = await systemService.post('brightness', { value })
    return result
}

export const setVolume = async (value: number) => {
    if (!DESKTOP) return
    const { systemService } = await READY
    const result = await systemService.post('volume', { value })
    return result
}