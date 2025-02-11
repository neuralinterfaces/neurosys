export function load () {

    return {
        feedback: { label: 'Brightness' },
        set: function (score) {
            const level = this.enabled ? (1 - score) : 0
            document.body.style.backgroundColor = `rgba(0, 0, 0, ${level})`
        }
    }
}