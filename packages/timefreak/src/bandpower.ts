import { periodogram } from './periodogram.js';
import { integrate, nextpow2 } from './utils.js';

export function bandpower(
    samples: number[],
    sample_rate: number,
    bands: [number, number][],
    options?: {
        fftSize?: number, 
        window?: 'hann' | 'rectangular'
    }
) {

    const signal_length = samples.length;

    // Handle default options
    const { fftSize, window } = Object.assign({
        fftSize: Math.pow(2, nextpow2(signal_length)),
        window: 'hann'
    }, options);

    if (fftSize < signal_length) throw new Error('fftSize must be greater than or equal to the length of samples');

    const psd = periodogram(samples, sample_rate, { fftSize: fftSize, window: window });
   
    // Calculate the total power for relative power calculation if selected in options
    const dx = sample_rate / fftSize;
    const total_power = integrate(psd.estimates, dx) 

    // Calculate area in each band
    const output = bands.map((band) => {
        const low_index = Math.floor(band[0] / sample_rate * fftSize);
        const high_index = Math.min(Math.ceil(band[1] / sample_rate * fftSize), psd.estimates.length - 1);
        const psd_band = psd.estimates.slice(low_index, high_index + 1);
        if (psd_band.length < 2) throw new Error('Unable to calculate power in specified bands. Please increase fftSize or sample length');
        return integrate(psd_band, dx);
    })

    return {
        total: total_power, // Return total power for relative power calculation
        bands: output
    };
}