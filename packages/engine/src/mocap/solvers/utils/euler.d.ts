import { RotationOrder, EulerRotation } from "../Types";
/** Euler rotation class. */
export default class Euler {
    x: number;
    y: number;
    z: number;
    rotationOrder?: RotationOrder;
    constructor(a?: number | EulerRotation, b?: number, c?: number, rotationOrder?: RotationOrder);
    /**
     * Multiplies a number to an Euler.
     * @param {number} a: Number to multiply
     */
    multiply(v: number): Euler;
}
