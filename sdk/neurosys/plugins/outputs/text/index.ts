import { Output } from "../../../core/src/plugins/output"

export function load () {
    
    return new Output({

        label: 'Text',

        async start() {

            // Dynamic import to avoid conflict with Commoners
            const { ScoreText } = await import("./ScoreText")
            const scoreText = new ScoreText()
            scoreText.style.position = "absolute"
            scoreText.style.top = "50px"
            scoreText.style.right = "25px"

            document.body.append(scoreText)

            return { text: scoreText }
        },

        set(score, info){
            info.text.score = score
        },

        stop({ text }) {
            text.remove()
        }
    })
}