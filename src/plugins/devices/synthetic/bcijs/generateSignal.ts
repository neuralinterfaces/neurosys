
const range =  (start: number, stop: number, step = 1) => Array.from({length: (stop - start) / step}, (_, i) => start + (i * step));
const zeros = (n: number) => Array.from({length: n}, _ => 0)
const add = (a: number[], b: number[]) => a.map((x, i) => x + b[i])
const sin = (a: number[]) => a.map((x) => Math.sin(x))

export function generateSignal(
    amplitudes: number[],
    frequencies: number[],
    sampleRate: number,
    duration: number
) {
	var x = range(0, duration, 1 / sampleRate);

	var signal = zeros(x.length)
	for (var i = 0; i < amplitudes.length; i++) {

        // Modify the signal by adding a sine wave for each frequency/amplitude pair
        const freq = 2 * Math.PI * frequencies[i]
        x = sin(x.map((x) => x * freq))
        const y = x.map((x) => x * amplitudes[i])
        signal = add(signal, y)
    }

	return signal
}