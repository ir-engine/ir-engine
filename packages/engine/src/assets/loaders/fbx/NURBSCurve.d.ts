import { Curve, Vector3, Vector4 } from "three";
/**
 * NURBS curve object
 *
 * Derives from Curve, overriding getPoint and getTangent.
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 *
 **/
export declare class NURBSCurve extends Curve<Vector3> {
    degree: number;
    knots: number[];
    controlPoints: any[];
    startKnot: number;
    endKnot: number;
    constructor(degree: number, knots: number[], controlPoints: Vector4[], startKnot: number, endKnot: number);
    getPoint(t: any, optionalTarget?: any): any;
    getTangent(t: any, optionalTarget?: any): any;
}
