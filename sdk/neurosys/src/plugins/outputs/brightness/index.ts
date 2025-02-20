import { Output } from "../../../core/plugins/output"

export function load () {

    return new Output({
        label: 'Brightness',
        set: function (score) {
            const level = this.enabled ? (1 - score) : 0
            document.body.style.backgroundColor = `rgba(0, 0, 0, ${level})`
        }
    })
}