// Because this is a literal single page application
// we detect a callback from Spotify by checking for the hash fragment
import { getAccessToken, authorize } from "./authCodeWithPkce";
import { setVolume } from "./controls";

const onBadAccessToken = async () => {
    localStorage.removeItem('code') // Invalid access token
    const code = await authorize();
    localStorage.setItem('code', code)
    handleCode(code);
}

const handleCode = async (code: string) => {

    const accessToken = await getAccessToken(code);

    const animateVolumeWithSine = async () => {
        const volume = Math.sin(Date.now() / 1000) * 50 + 50;
        const result = await setVolume({ value: volume, token: accessToken });
        const { error = {} } = result;
        const { status, message } = error
        if (status) {
            console.error(status, message)
            if (status === 401) return onBadAccessToken()
        }
        setTimeout(animateVolumeWithSine, 500);
    }

    animateVolumeWithSine();
}



// Catch if the redirect ends up here
const searchCode = new URLSearchParams(location.search).get('code')
if (searchCode) document.location.search = `?code=${searchCode}`

// Otherwise handle the actual behaviors of the page
else {

    const code = localStorage.getItem('code')

    if (code) handleCode(code);
    else {
        const code = await authorize();
        localStorage.setItem('code', code)
        handleCode(code);
    }

}