import { periodogram } from './periodogram.js';
import { integrate, nextpow2 } from './utils.js';

type Band = [number, number]

export function bandpower(
    samples: number[],
    sample_rate: number,
    bands: Array<string | Band>,
    options?: {
        fftSize?: number, 
        relative?: boolean, 
        window?: 'hann' | 'rectangular'
    }
) {

    const signal_length = samples.length;

    // Handle default options
    const { fftSize, relative, window } = Object.assign({
        fftSize: Math.pow(2, nextpow2(signal_length)),
        relative: false,
        window: 'hann'
    }, options);

    if (fftSize < signal_length) throw new Error('fftSize must be greater than or equal to the length of samples');

    const psd = periodogram(samples, sample_rate, { fftSize: fftSize, window: window });
   
    // Calculate the total power for relative power calculation if selected in options
    const dx = sample_rate / fftSize;
    const total_power = relative ? integrate(psd.estimates, dx) : 1;

    // Calculate area in each band
    return bands.map((band) => {
        const low_index = Math.floor(band[0] / sample_rate * fftSize);
        const high_index = Math.min(Math.ceil(band[1] / sample_rate * fftSize), psd.estimates.length - 1);
        const psd_band = psd.estimates.slice(low_index, high_index + 1);
        if (psd_band.length < 2) throw new Error('Unable to calculate power in specified bands. Please increase fftSize or sample length');
        return integrate(psd_band, dx) / total_power;
    })
}