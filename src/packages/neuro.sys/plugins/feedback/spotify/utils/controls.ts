export async function setVolume({ value: volume, token }: { value: number, token: string }) {
    const result = await fetch("https://api.spotify.com/v1/me/player/volume?volume_percent=" + volume.toFixed(0), { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
    const text = await result.text();
    return text ? JSON.parse(text) : {};
}