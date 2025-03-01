type NormProps = {
    min?: number
    max?: number
    raw?: number
}

export class Norm {

    min: number
    max: number
    raw: number

    constructor({ min = NaN, max = NaN, raw = NaN }: NormProps = {}) {
        this.min = min
        this.max = max
        this.raw = raw
    }

    reset() {
        this.min = NaN
        this.max = NaN
        this.raw = NaN
    }

    update(value: number) {
        this.min = isNaN(this.min) ? value : (value < this.min ? value : this.min);
        this.max = isNaN(this.max) ? value : (value > this.max ? value : this.max);
        return this.normalize(value)
    }

    get() { return this.normalize(this.raw) }

    normalize(value: number) {        
        this.raw = value
        return Math.max(0, Math.min(1, (value - this.min) / (this.max - this.min)))
    }
}
