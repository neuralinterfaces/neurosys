export function load () {
    
    const element = document.createElement('p')
    element.style.padding = "10px 20px"
    element.style.color = "white"
    element.style.background = "#111"
    element.style.borderRadius = "10px"
    element.style.position = "absolute"
    element.style.top = "35px"
    element.style.right = "25px"
    element.style.display = 'none'
    element.innerHTML = "<b>Score:</b> <span class='score'>—</span>"
    document.body.append(element)

    const scoreEl = element.querySelector(".score") as HTMLSpanElement

    return {
        feedback: { label: 'Text' },
        set: function (score) {
            element.style.display = this.enabled ? "block" : "none"
            scoreEl.innerText = score.toFixed(3)
        }
    }
}