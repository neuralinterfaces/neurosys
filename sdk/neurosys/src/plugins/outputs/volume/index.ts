// NOTE: This plugin requires a specific service to be configured

import { Output } from "../../../core/plugins/output"

export default ( serviceName: string ) => ({
    load() {

        if (!commoners.SERVICES[serviceName]) return

        return new Output({
            label: 'Volume',
            set: async (score) => {
                const { url } = commoners.SERVICES[serviceName]
                if (isNaN(score)) return // Only send valid scores
                await fetch(url, { method: 'POST', body: JSON.stringify({ score }) })
            }
        })
    }
})