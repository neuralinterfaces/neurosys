export function load () {
    
    return {
        feedback: { label: 'Text' },

        start() {
            const element = document.createElement('p')
            element.style.padding = "10px 20px"
            element.style.color = "white"
            element.style.background = "#111"
            element.style.borderRadius = "10px"
            element.style.position = "absolute"
            element.style.top = "35px"
            element.style.right = "25px"
            element.innerHTML = "<b>Score:</b> <span class='score'>—</span>"
            document.body.append(element)
            const scoreEl = element.querySelector(".score") as HTMLSpanElement

            return { elements: { main: element, score: scoreEl } }
        },

        set(score, info){
            const scoreEl = info.elements.score
            scoreEl.innerText = score.toFixed(3)
        },

        stop({ elements }) {
            elements.main.remove()
        }
    }
}