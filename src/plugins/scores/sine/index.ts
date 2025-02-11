const score = {
    label: 'Sine Wave'
}

export function load() {

    return {
        score,
        get: () => (Math.sin(Date.now() / 1000) + 1) / 2
    }
}