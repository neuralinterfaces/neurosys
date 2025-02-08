const CLIENT_ID =  "fbc5499a1807444ab44974e2836ea9f4"
const scopes = [ "user-modify-playback-state" ]
const redirectURI = "http://localhost:5173/callback";

export const authorize = (): Promise<string> => {

    return new Promise(async (resolve, reject) => {
        const url = await getRedirectURLForAuth();

        const popup = window.open(url, "popup", "width=600,height=800") as Window;

        const interval = setInterval(() => {
            const { location } = popup;

            // Stop if the popup was closed
            if (popup.closed) {
                clearInterval(interval);
                return reject('Popup was closed');
            }

            try {
                const redirectedTo = location.href // Redirect. This check fails if the popup is not redirected
                clearInterval(interval);
                popup.close()
                const params = new URLSearchParams(location.search);
                const code = params.get("code");
                resolve(code)
            } catch (e) { } // Fails while waiting
        }, 500);
    });

}

export async function getRedirectURLForAuth() {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectURI);
    params.append("scope", scopes.join(" "))
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(code: string) {

    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectURI);
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });
    

    const accessTokenResult = await result.json();
    console.log(accessTokenResult)
    const { access_token } = accessTokenResult;
    return access_token;
}

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
