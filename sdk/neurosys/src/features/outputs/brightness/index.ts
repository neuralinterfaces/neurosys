import { Output } from "../../../core/plugins/output"

export function load () {

    return new Output({
        label: 'Brightness',
        stop () {
            document.body.style.backgroundColor = "" // Reset
        },
        set ({ score }) {
            const level = 1 - score
            document.body.style.backgroundColor = `rgba(0, 0, 0, ${level})`
        }
    })
}