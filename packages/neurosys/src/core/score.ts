type Target = [number, number]

type ScoreProps = {
    min?: number
    max?: number
    raw?: number,
    target?: boolean | Target
}

export class Score {

    min: number
    max: number
    raw: number
    #target: Target
    target: boolean

    #history: number[] = []

    constructor({ 
        min = NaN, 
        max = NaN, 
        raw = NaN, 
        target = true 
    }: ScoreProps = {}) {
        this.min = min
        this.max = max
        this.raw = raw
        this.target = !!target
        this.#target = Array.isArray(target) ? [ ...target ] : [ NaN, NaN ]
    }

    reset() {
        this.min = NaN
        this.max = NaN
        this.raw = NaN
        this.#target = [NaN, NaN]
        this.#history = []
    }

    update(value: number) {
        this.min = isNaN(this.min) ? value : (value < this.min ? value : this.min);
        this.max = isNaN(this.max) ? value : (value > this.max ? value : this.max);

        // Update the target values
        if (!isNaN(value)) this.#history.push(value)

        // Mean value
        const mean = this.#history.reduce((acc, value) => acc + value, 0) / this.#history.length
        const std = Math.sqrt(this.#history.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / this.#history.length)

        this.#target = [ 
            mean,
            mean + std
        ]

        return this.normalize(value)
    }

    get() { return this.normalize(this.raw) }

    getTarget() { return structuredClone(this.#target) }

    inTarget() {
        return this.raw >= this.#target[0] && this.raw <= this.#target[1]
    }

    normalize(value: number) {        
        this.raw = value
        const [ min, max ] = this.target ? this.#target : [ this.min, this.max ]
        return Math.max(0, Math.min(1, (value - min) / (max - min))) // Clamp at 0/1 while togging between target and min/max norm
    }
}
