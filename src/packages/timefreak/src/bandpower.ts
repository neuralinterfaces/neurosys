import { periodogram } from './periodogram.js';
import { transpose } from './transpose.js';
import { nextpow2 } from './nextpow2.js';

function integrate(x: number[], dx: number = 1) {
    let sum = 0;
    for(let i = 0; i < x.length; i++) sum += x[i];
    return sum * dx;
}

const DEFAULT_BANDS = {
    delta: [1, 3],
    theta: [4, 7],
    alpha: [8, 12],
    beta: [13, 30],
    gamma: [31, 50]
}

function reduceBands(bands: string | [number, number]) { 
    
    // If they pass only a string or only a single band
    // Example: 'alpha' or [4, 10]
    if(typeof bands === 'string' || typeof bands[0] === 'number') {
        bands = [bands];
    }

    // For each item in the array, replace a string with its matching band
    return bands.map(band => {
        if(typeof band === 'string') {
            let band_as_numbers = DEFAULT_BANDS[band];
            if(band_as_numbers) return band_as_numbers;
            throw new Error('Invalid band type passed');
        }

        return band;
    });
}

/**
 * // Single signal example
 * let samples = [0.23, 0.14, 0.78, ...];
 * let sample_rate = 256; // Hz
 * 
 * bandpower(samples, sample_rate, 'alpha'); // returns power, ex: 1.652
 * bandpower(samples, sample_rate, ['alpha', 'beta']); // returns an array with the powers in the alpha and beta bands. Ex: [1.473, 0.383]
 * 
 * // 2 channel example
 * samples = [[0.1, 0.3], [0.4, 0.2], [0.6, 0.5], ...]
 * 
 * bandpower(samples, sample_rate, 'alpha'); // returns an array of alpha powers for each channel, ex: [1.342, 0.342]
 * 
 * bandpower(samples, sample_rate, ['alpha', 'beta']);
 * // returns an array of arrays of powers in each band, ex: [[1.342, 0.342], [0.245, 1.343]].
 * // The first array is an array of alpha powers for channels 1 and 2
 * // The second array is an array of beta powers for channels 1 and 2
 * 
 * bandpower(samples, sample_rate, ['alpha', 'beta'], {average: true});
 * // Calculate average alpha across all channels and average beta across all channels
 * // Returns a value such as [0.842, 0.794]
 * // Note these are the average of [1.342, 0.342] and the average of [0.245, 1.343] from the previous example
 */

export function bandpower(
    samples: number[] | number[][],
    sample_rate: number,
    bands: string | [number, number] | Array<string | [number, number]>,
    options?: {
        fftSize?: number, 
        average?: boolean, 
        input?: 'samples' | 'psd', 
        relative?: boolean, 
        window?: 'hann' | 'rectangular'
    }
) {
    // Determine signal length
    let signal_length = samples.length;
    if (samples.estimates) signal_length = samples.estimates.length;

    // Handle default options
    let {fftSize, average, input, relative, window} = Object.assign({
        fftSize: Math.pow(2, nextpow2(signal_length)),
        average: false,
        input: 'samples',
        relative: false,
        window: 'hann'
    }, options);

    // If they passed a PSD object, enforce the input type 'psd'
    if(options && options['input'] == 'samples' && !Array.isArray(samples)) {
        throw new Error('Expecting array of samples when input type of \'samples\' is passed');
    }

    if(samples.estimates) {
        samples = samples.estimates;
        input = 'psd';
    }

    // Check FFT size
    if(fftSize < samples.length) {
        throw new Error('fftSize must be greater than or equal to the length of samples');
    }

    // Clean up 'bands' so it is a number[][] (array of bands where a band is [low, high])
    let original_bands = bands;
    bands = reduceBands(bands);
    
    // If matrix with muliple signals, process each signal
    if(Array.isArray(samples[0])) {
        let channels = transpose(samples);
        
        let powers = channels.map(channel => bandpower(channel, sample_rate, bands, options));

        // Return to same row/col format as input (channels are columns)
        powers = transpose(powers);

        // Instead of calculating, for example, alpha power at each channel, calculate the average alpha
        // across all channels.
        if(average) {
            for(let i = 0; i < powers.length; i++) {
                let sum = 0;
                for(let j = 0; j < powers[i].length; j++) {
                    sum += powers[i][j];
                }
                powers[i] = sum / powers[i].length;
            }
        }

        // If they only passed a single band (not an array of bands), then the array of areas will
        // have a length of 1. Return the single power value, not an array.
        if(typeof original_bands === 'string' || typeof original_bands[0] === 'number') {
            return powers[0];
        }

        return powers;
    }

    // Start by calculating the PSD
    let psd;
    if(input == 'samples') {
        psd = periodogram(samples, sample_rate, {fftSize: fftSize, window: window});
    } else if(input == 'psd') {
        if(Array.isArray(samples)) {
            psd = {estimates: samples};
        } else {
            throw new Error('Invalid PSD');
        }
    } else {
        throw new Error('Invalid input type');
    }

    // Calculate the total power for relative power calculation if selected in options
    let total_power = 1;
    let dx = sample_rate / fftSize;
    if(relative) {
        total_power = integrate(psd.estimates, dx);
    }

    // Calculate area in each band
    let areas = new Array(bands.length);
    
    for(let i = 0; i < bands.length; i++) {
        // Get the proper section of the periodogram
        let band = bands[i];

        let low_index = Math.floor(band[0] / sample_rate * fftSize);
        let high_index = Math.min(Math.ceil(band[1] / sample_rate * fftSize), psd.estimates.length - 1);
        
        let psd_band = psd.estimates.slice(low_index, high_index + 1);

        if(psd_band.length < 2) {
            throw new Error('Unable to calculate power in specified bands. Please increase fftSize or sample length');
        }

        areas[i] = integrate(psd_band, dx) / total_power;
    }

    // If they only passed a single band (not an array of bands), then the array of areas will
    // have a length of 1. Return the single power value, not an array.
    if(typeof original_bands === 'string' || typeof original_bands[0] === 'number') return areas[0];

    return areas;
}