import { XYZ, AxisMap, EulerRotation } from "../Types";
/** Vector Math class. */
export default class Vector {
    x: number;
    y: number;
    z: number;
    constructor(a?: number[] | XYZ | number | Vector | EulerRotation, b?: number, c?: number);
    /**
     * Returns the negative of this vector.
     */
    negative(): Vector;
    /**
     * Add a vector or number to this vector.
     * @param {Vector | number} a: Vector or number to add
     * @returns {Vector} New vector
     */
    add(v: Vector | number): Vector;
    /**
     * Substracts a vector or number from this vector.
     * @param {Vector | number} a: Vector or number to subtract
     * @returns {Vector} New vector
     */
    subtract(v: Vector | number): Vector;
    /**
     * Multiplies a vector or a number to a vector.
     * @param {Vector | number} a: Vector or number to multiply
     * @param {Vector} b: Vector to multiply
     */
    multiply(v: Vector | number): Vector;
    /**
     * Divide this vector by a vector or a number.
     * @param {Vector | number} a: Vector or number to divide
     * @returns {Vector} New vector
     */
    divide(v: Vector | number): Vector;
    /**
     * Check if the given vector is equal to this vector.
     * @param {Vector} v: Vector to compare
     * @returns {boolean} True if equal
     */
    equals(v: Vector): boolean;
    /**
     * Returns the dot product of this vector and another vector.
     * @param {Vector} v: Vector to dot
     * @returns {number} Dot product
     */
    dot(v: Vector): number;
    /**
     * Cross product of two vectors.
     * @param {Vector} a: Vector to cross
     * @param {Vector} b: Vector to cross
     */
    cross(v: Vector): Vector;
    /**
     * Get the length of the Vector
     * @returns {number} Length
     */
    length(): number;
    /**
     * Find the distance between this and another vector.
     * @param {Vector} v: Vector to find distance to
     * @param {2 | 3} d: 2D or 3D distance
     * @returns {number} Distance
     */
    distance(v: Vector, d?: 2 | 3): number;
    /**
     * Lerp between this vector and another vector.
     * @param {Vector} v: Vector to lerp to
     * @param {number} fraction: Fraction to lerp
     * @returns {Vector}
     */
    lerp(v: Vector, fraction: number): Vector;
    /**
     * Returns the unit vector of this vector.
     * @returns {Vector} Unit vector
     */
    unit(): Vector;
    min(): number;
    max(): number;
    /**
     * To Angles
     * @param {AxisMap} [axisMap = {x: "x", y: "y", z: "z"}]
     * @returns {{ theta: number, phi: number }}
     */
    toSphericalCoords(axisMap?: AxisMap): {
        theta: number;
        phi: number;
    };
    /**
     * Returns the angle between this vector and vector a in radians.
     * @param {Vector} a: Vector
     * @returns {number}
     */
    angleTo(a: Vector): number;
    /**
     * Array representation of the vector.
     * @param {number} n: Array length
     * @returns {number[]} Array
     * @example
     * new Vector(1, 2, 3).toArray(); // [1, 2, 3]
     */
    toArray(n: number): number[];
    /**
     * Clone the vector.
     * @returns {Vector} New vector
     */
    clone(): Vector;
    /**
     * Init this Vector with explicit values
     * @param {number} x: X value
     * @param {number} y: Y value
     * @param {number} z: Z value
     */
    init(x: number, y: number, z: number): this;
    static negative(a: Vector, b?: Vector): Vector;
    static add(a: Vector, b: Vector | number, c?: Vector): Vector;
    static subtract(a: Vector, b: Vector | number, c?: Vector): Vector;
    static multiply(a: Vector, b: Vector | number, c?: Vector): Vector;
    static divide(a: Vector, b: Vector | number, c?: Vector): Vector;
    static cross(a: Vector, b: Vector, c?: Vector): Vector;
    static unit(a: Vector, b: Vector): Vector;
    /**
     * Create new vector from angles
     * @param {number} theta: Theta angle
     * @param {number} phi: Phi angle
     * @returns {Vector} New vector
     */
    static fromAngles(theta: number, phi: number): Vector;
    static randomDirection(): Vector;
    static min(a: Vector, b: Vector): Vector;
    static max(a: Vector, b: Vector): Vector;
    /**
     * Lerp between two vectors
     * @param {Vector} a: Vector a
     * @param {Vector} b: Vector b
     * @param {number} fraction: Fraction
     */
    static lerp<T extends number | Vector>(a: T, b: T, fraction: number): T;
    /**
     * Create a new vector from an Array
     * @param {number[]} array: Array
     * @returns {Vector} New vector
     */
    static fromArray(a: Array<number> | XYZ): Vector;
    /**
     * Angle between two vectors
     * @param {Vector} a: Vector a
     * @param {Vector} b: Vector b
     * @returns
     */
    static angleBetween(a: Vector, b: Vector): number;
    static distance(a: Vector, b: Vector, d: number): number;
    static toDegrees(a: number): number;
    static normalizeAngle(radians: number): number;
    static normalizeRadians(radians: number): number;
    static find2DAngle(cx: number, cy: number, ex: number, ey: number): number;
    /**
     * Find 3D rotation between two vectors
     * @param {Vector} a: First vector
     * @param {Vector} b: Second vector
     * @param {boolean} normalize: Normalize the result
     */
    static findRotation(a: Vector | XYZ, b: Vector | XYZ, normalize?: boolean): Vector;
    /**
     * Find roll pitch yaw of plane formed by 3 points
     * @param {Vector} a: Vector
     * @param {Vector} b: Vector
     * @param {Vector} c: Vector
     */
    static rollPitchYaw(a: Vector | XYZ, b: Vector | XYZ, c?: Vector): Vector;
    /**
     * Find angle between 3D Coordinates
     * @param {Vector | number} a: Vector or Number
     * @param {Vector | number} b: Vector or Number
     * @param {Vector | number} c: Vector or Number
     */
    static angleBetween3DCoords(a: Vector | XYZ, b: Vector | XYZ, c: Vector | XYZ): number;
    /**
     * Get normalized, spherical coordinates for the vector bc, relative to vector ab
     * @param {Vector | number} a: Vector or Number
     * @param {Vector | number} b: Vector or Number
     * @param {Vector | number} c: Vector or Number
     * @param {AxisMap} axisMap: Mapped axis to get the right spherical coords
     */
    static getRelativeSphericalCoords(a: Vector | XYZ, b: Vector | XYZ, c: Vector | XYZ, axisMap: AxisMap): {
        theta: number;
        phi: number;
    };
    /**
     * Get normalized, spherical coordinates for the vector bc
     * @param {Vector | number} a: Vector or Number
     * @param {Vector | number} b: Vector or Number
     * @param {AxisMap} axisMap: Mapped axis to get the right spherical coords
     */
    static getSphericalCoords(a: Vector | XYZ, b: Vector | XYZ, axisMap?: AxisMap): {
        theta: number;
        phi: number;
    };
}
