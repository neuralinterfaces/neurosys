import loudness from 'loudness';

// const mute = await loudness.getMuted()
// const vol = await loudness.getVolume()
// await loudness.setMuted(true)

export async function setVolume(score: null | number) {
    if (score === null) throw new Error("Invalid volume value");
    const volume = Math.max(0, Math.min(1, score)) * 100
    return await loudness.setVolume(volume)
}