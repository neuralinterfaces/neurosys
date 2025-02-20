// NOTE: This plugin requires a specific service to be configured

import { Score } from "../../../core/src/plugins"
import { Output } from "../../../core/src/plugins/output"

export default {
    load() {

        if (!commoners.SERVICES.volume) return

        return new Output({
            label: 'Volume',
            set: async (score) => {
                const { url } = commoners.SERVICES.volume
                if (isNaN(score)) return // Only send valid scores
                await fetch(url, { method: 'POST', body: JSON.stringify({ score }) })
            }
        })
    }
}