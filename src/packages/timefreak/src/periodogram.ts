import { nextpow2 } from './utils';
import fft from 'fft.js';

let fftCache = {};

function hann(signal: number[]) {
    const windowed = [];
    const L = signal.length - 1;
    const C = Math.PI / L;

    let scale = 0;

    for(let i = 0; i < signal.length; i++) {
        let w = Math.sin(C * i) ** 2;
        windowed.push(signal[i] * w);
        scale += w ** 2;
    }

    return { signal: windowed, scale: scale };
}

function taper(
    signal: number[],
    taper: number[]
) {

    if(signal.length != taper.length)  throw new Error('Signal length must match taper length');

    const windowed = [];
    let scale = 0;

    for(let i = 0; i < signal.length; i++) {
        windowed.push(signal[i] * taper[i]);
        scale += taper[i] ** 2;
    }

    return { signal: windowed, scale: scale };
}

export function periodogram(
    signal: number[],
    sample_rate: number,
    options: {
        fftSize?: number,  // Should be a power of 2
        window?: string | number[], // 'hann', 'rectangular', or a custom window
        _scaling?: 'psd' | 'none' // 'psd' for power spectral density, 'none' for unscaled
    } = {}
) {

	const { fftSize, window, _scaling } = Object.assign({
        fftSize: Math.pow(2, nextpow2(signal.length)),
        window: 'rectangular',
        _scaling: 'psd'
	}, options);

	let f;

	if (fftCache.hasOwnProperty(fftSize)) f = fftCache[fftSize];
    else {
		f = new fft(fftSize);
		fftCache[fftSize] = f;
    }

    // Validate _scaling
    if (_scaling != 'psd' && _scaling != 'none') throw new Error('Unknown scaling');
    
    // Apply window
    const num_samples = signal.length;
    let S = num_samples;
    if (Array.isArray(window)) {
        const t = taper(signal, window);
        signal = t.signal;
        S = t.scale;
    }

    else if(window == 'hann') {
        const h = hann(signal);
        signal = h.signal;
        S = h.scale;
    } 
    
    else if (window != 'rectangular') throw new Error('Unknown window type');

    // Zero pad signal to fftSize if needed
	if (num_samples < fftSize) signal = signal.concat(Array(fftSize - signal.length).fill(0));

    // Complex array [real, imag, real, imag, etc.]
    let freqs = f.createComplexArray();
    
    // Fill in complex array with the FFT values
	f.realTransform(freqs, signal);
    f.completeSpectrum(freqs);
    
    // Get the power of each FFT bin value
    let powers = [];
    
    let scaling_factor = 2 / (sample_rate * S);
    if(_scaling == 'none') scaling_factor = 1;

	for (var i = 0; i < freqs.length - 1; i += 2) {
        // magnitude is sqrt(real^2 + imag^2)
        let magnitude = Math.sqrt(freqs[i] ** 2 + freqs[i + 1] ** 2);

        // apply scaling
        let power = scaling_factor * magnitude ** 2;

		powers.push(power);
    }

    // Toss values past Nyquist
    powers = powers.slice(0, powers.length / 2 + 1);

    // Don't scale DC or Nyquist by 2
    if(_scaling == 'psd') {
        powers[0] /= 2;
        powers[powers.length - 1] /= 2;
    }
    
	return {
        estimates: powers,
        frequencies: powers.map((p, i) => i * (sample_rate / fftSize)),
    };
}