import { Output } from "../../../core/plugins/output"

export default {
    load() {

        const { PROD } = commoners
        if (PROD) return

        return new Output({
            label: 'Print in Main Process',
            start({ cache = 0 }) {
                const counter = cache + 1
                console.log('Plugin activated', counter)
                return { counter }
            },
            stop({ counter }) {
                console.log('Plugin deactivated')
                return { cache: counter }
            },
            set: (score) => this.send("score", score) 
        })
    },
    desktop: {
        load () {
            this.on("score", (_, score) => console.log("Score:", score) )
        }
    }
}
