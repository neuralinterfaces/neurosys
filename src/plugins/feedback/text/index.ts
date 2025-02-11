export function load () {
    
    const element = document.createElement('p')
    element.style.padding = "25px 25px"
    element.style.position = "absolute"
    element.style.top = "0"
    element.style.right = "0"
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