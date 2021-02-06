/** Generate random Id */
export declare function randomId(): string;
/**
 * Create pseudo random number from seed
 * @param s Seed
 * @returns Function to generate pseudo random numbers.
 */
export declare function createPseudoRandom(s: any): Function;
/**
 * Generate random number between 2 numbers
 * @param min
 * @param max
 * @param rndFn Random function to be used to generate random number.
 * @returns Random number between min and max limit.
 */
export declare function randomNumber(min: any, max: any, rndFn?: () => number): any;
/**
 * Generate an Object with keys filled with random number, object or array.
 * All keys of the min object will be added into generated object.
 * @param min
 * @param max
 * @param rndFn Random function to be used to generate random number.
 * @returns Object with keys filled with random number.
 */
export declare function randomObject(min: any, max: any, rndFn?: () => number): any;
/**
 * Generate an array with random elements.
 * @param min
 * @param max
 * @param rndFn Random function to be used to generate random number.
 * @returns Array with random elements.
 */
export declare function randomArray(min: any, max: any, rndFn?: () => number): any;
/**
 * Generate random number, object or array. Type of output will be same as type of min.
 * @param min min value. Type of min will decide what to return.
 * @param max
 * @param rndFn Random function to be used to generate random number.
 * @returns Random number, object or array
 */
export declare function randomize(min: any, max: any, rndFn?: () => number): any;
/** @returns Generate random box offset. */
export declare const randomBoxOffset: (dx: any, dy: any, dz: any, rndFn?: () => number) => {
    x: number;
    y: number;
    z: number;
};
/** @returns Generate random ellipsoid offset. */
export declare const randomEllipsoidOffset: (rx: any, ry: any, rz: any, rndFn?: () => number) => {
    x: number;
    y: number;
    z: number;
};
/** @returns Generate random sphere offset. */
export declare const randomSphereOffset: (r: any, rndFn: any) => {
    x: number;
    y: number;
    z: number;
};
/** @returns Generate random cube offset. */
export declare const randomCubeOffset: (d: any, rndFn: any) => {
    x: number;
    y: number;
    z: number;
};
