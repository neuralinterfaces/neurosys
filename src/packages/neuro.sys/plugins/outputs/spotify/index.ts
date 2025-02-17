import { getAccessToken, refreshToken, authorize } from "./utils/authCodeWithPkce";
import { setVolume } from "./utils/controls";


export default {
    load() {

        return {

            label: 'Spotify Volume',
            
            async start() {

                const getValidToken = async () => {
                    const existingToken = localStorage.getItem('access_token')
                    if (existingToken) return existingToken
                    const existingRefreshToken = localStorage.getItem('refresh_token')
                    const info = existingRefreshToken ? await refreshToken(existingRefreshToken) : await getAccessToken(await authorize())
                    const { access_token, refresh_token } = info;
                    localStorage.setItem('access_token', access_token)
                    if (refresh_token) localStorage.setItem('refresh_token', refresh_token) 
                    return access_token;
                }

                const onBadAccessToken = async () => {
                    localStorage.removeItem('access_token') // Invalid access token
                    const access_token = await getValidToken()
                    handleCode(access_token);
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
                    const access_token = await getValidToken()
                    handleCode(access_token);
                }
            },
            stop() {
                // for (const value of Object.values(elements)) value.parent.remove()
            },
            set(score) {
                console.log('SETTING', score)
            }
        }
    }
}