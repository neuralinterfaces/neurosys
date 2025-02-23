import { Output } from "../../../core/plugins/output"

export default new Output({
    label: 'Brightness',
    settings: {
        range: [ 0.3, 1 ],
    },
    stop () {
        document.body.style.backgroundColor = "" // Reset
    },
    set ({ score }) {
        const { range } = this.settings
        const [ min = 0, max = 1 ] = range
        const normalized = min + ((max - min) * score)
        document.body.style.backgroundColor = `rgba(0, 0, 0, ${ (1 - normalized)})`
    }
})