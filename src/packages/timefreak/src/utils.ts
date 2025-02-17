
export const nextpow2 = (num: number) => Math.ceil(Math.log2(Math.abs(num)));


export const transpose = (array: any[]) => {
    const arrayDimensionsValid = array.every((row) => row.length === array[0].length);
    if (!arrayDimensionsValid) throw new Error('Array dimension error: must be 2d array with equal row lengths');
    return array[0].map((_, i) => array.map(row => row[i]));
}

export const integrate = (arr: number[], dx: number = 1)  => arr.reduce((a, b) => a + b) * dx;

