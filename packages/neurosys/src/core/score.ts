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

    #retentionPeriod: number = 10 // Retention period in seconds
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

        // Filter out old values
        const now = performance.now()
        this.#history = this.#history.filter(({ timestamp }) => now - timestamp < this.#retentionPeriod * 1000)
        
        // Update the target values
        if (!isNaN(value)) this.#history.push({ value, timestamp: now })


        // Mean value
        const mean = this.#history.reduce((acc, { value }) => acc + value, 0) / this.#history.length
        const std = Math.sqrt(this.#history.reduce((acc, { value }) => acc + Math.pow(value - mean, 2), 0) / this.#history.length)

        // Reward at 50% for maintaining the mean value
        this.#target = [ 
            mean - 2*std, 
            mean + 2*std
        ]

        return this.normalize(value)
    }

    get() { return this.normalize(this.raw) }

    getTarget() { return structuredClone(this.#target) }

    inTarget() {
        return this.raw >= this.#target[0] && this.raw <= this.#target[1]
    }

    normalize(
        value: number,
        bounds: false | Target = this.target ? this.#target : false
    ) {        
        this.raw = value
        const resolvedBounds = !bounds ? [ this.min, this.max ] : bounds
        const [ min, max ] = resolvedBounds
        return Math.max(0, Math.min(1, (value - min) / (max - min))) // Clamp at 0/1 while togging between target and min/max norm
    }
}
