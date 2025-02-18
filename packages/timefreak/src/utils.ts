
export const nextpow2 = (num: number) => Math.ceil(Math.log2(Math.abs(num)));

export const integrate = (arr: number[], dx: number = 1)  => arr.reduce((a, b) => a + b) * dx;

