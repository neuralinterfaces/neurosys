export class Norm {

    min: number
    max: number

    constructor({ min = NaN, max = NaN } = {}) {
        this.min = min
        this.max = max
    }

    reset() {
        this.min = NaN
        this.max = NaN
    }

    update(value: number) {
        this.min = isNaN(this.min) ? value : (value < this.min ? value : this.min);
        this.max = isNaN(this.max) ? value : (value > this.max ? value : this.max);
    }

    normalize(value: number) {
        return Math.max(0, Math.min(1, (value - this.min) / (this.max - this.min)))
    }
}
