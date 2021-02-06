import { Vector3, Vector4 } from "three";
/**************************************************************
 *	NURBS Utils
 **************************************************************/
export declare function findSpan(p: number, u: number, U: number[]): number;
export declare function calcBasisFunctions(span: number, u: number, p: number, U: number[]): number[];
export declare function calcBSplinePoint(p: number, U: number[], P: Vector4[], u: number): Vector4;
export declare function calcBasisFunctionDerivatives(span: number, u: number, p: number, n: number, U: number[]): number[][];
export declare function calcBSplineDerivatives(p: number, U: number[], P: Vector4[], u: number, nd: number): Vector4[];
export declare function calcKoverI(k: number, i: number): number;
export declare function calcRationalCurveDerivatives(Pders: Vector4[]): Vector3[];
export declare function calcNURBSDerivatives(p: number, U: number[], P: Vector4[], u: number, nd: number): Vector3[];
export declare function calcSurfacePoint(p: number, q: number, U: number[], V: number[], P: Vector4[], u: number, v: number, target: Vector3): void;
