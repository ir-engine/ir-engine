export declare function randomId(): string;
export declare function createPseudoRandom(s: any): () => number;
export declare function randomNumber(min: any, max: any, rndFn?: () => number): any;
export declare function randomObject(min: any, max: any, rndFn?: () => number): any;
export declare function randomArray(min: any, max: any, rndFn?: () => number): any;
export declare function randomize(min: any, max: any, rndFn?: () => number): any;
export declare const randomBoxOffset: (dx: any, dy: any, dz: any, rndFn?: () => number) => {
    x: number;
    y: number;
    z: number;
};
export declare const randomEllipsoidOffset: (rx: any, ry: any, rz: any, rndFn?: () => number) => {
    x: number;
    y: number;
    z: number;
};
export declare const randomSphereOffset: (r: any, rndFn: any) => {
    x: number;
    y: number;
    z: number;
};
export declare const randomCubeOffset: (d: any, rndFn: any) => {
    x: number;
    y: number;
    z: number;
};
