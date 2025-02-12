export default {
    load() {
        const { send } = this
        return {
            feedback: { label: 'Print in Main Process' },
            set: function (score) { this.enabled && send("score", score) }
        }
    },
    desktop: {
        load: function () {
            this.on("score", (_, score) => console.log("Score:", score) )
        }
    }
}
