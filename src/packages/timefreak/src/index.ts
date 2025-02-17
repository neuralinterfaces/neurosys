export * from './bandpower'

const range =  (start: number, stop: number, step = 1) => Array.from({length: (stop - start) / step}, (_, i) => start + (i * step));

export function generateSignal(
    amplitudes: number[],
    frequencies: number[],
    sampleRate: number,
    duration: number
) {

	const x = range(0, duration, 1/sampleRate);

     // Modify the signal by adding a sine wave for each frequency/amplitude pair
    return x.map((x, i) => amplitudes.reduce((a, b, j) => a + (b * Math.sin(2 * Math.PI * frequencies[j] * x)), 0))
}