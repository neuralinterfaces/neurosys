// NOTE: This plugin requires a specific service to be configured

export default {
    load() {

        const { SERVICES: { volume } } = commoners
        if (!volume) return

        const { url } = volume

        return {
            label: 'Volume',
            set: async (score) => {
                if (isNaN(score)) return // Only send valid scores
                await fetch(url, { method: 'POST', body: JSON.stringify({ score }) })
            }
        }
    }
}