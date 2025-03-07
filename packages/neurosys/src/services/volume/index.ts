import loudness from 'loudness';

export async function getVolume() {
    const volume = await loudness.getVolume()
    return volume / 100
}

export async function getMuted() {
    return await loudness.getMuted()
}

export async function setMuted(muted: boolean) {
    return await loudness.setMuted(muted)
}

export async function setVolume(pct: null | number) {
    if (pct === null) throw new Error("Invalid volume value");
    const volume = Math.max(0, Math.min(1, pct))  * 100
    return await loudness.setVolume(volume)
}