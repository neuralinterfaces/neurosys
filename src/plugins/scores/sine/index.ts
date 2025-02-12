export const load = () => ({
    score: { label: 'Sine Wave' },
    get: () => (Math.sin(Date.now() / 1000) + 1) / 2,
})
