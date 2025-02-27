import { Output } from "../../../../sdk/neurosys/src/core/plugins/output"

export default new Output({

    label: 'Text',

    settings: {
        xAnchor: "right",
        yAnchor: "top",
    },

    async start() {

        const { xAnchor, yAnchor } = this.settings

        // Dynamic import to avoid conflict with Commoners
        const { ScoreText } = await import("./ScoreText")
        const scoreText = new ScoreText()
        scoreText.style.position = "absolute"
        scoreText.style[yAnchor] = "50px"
        scoreText.style[xAnchor] = "25px"

        document.body.append(scoreText)

        return { text: scoreText }
    },

    set({ score }, info){
        info.text.score = score
    },

    stop({ text }) {
        text.remove()
    }
})