import vec3, { vec4 } from "gl-matrix";
import vec2 from "gl-matrix";
import BinaryValue from "../enums/BinaryValue";
export declare type Binary = BinaryValue.ON | BinaryValue.OFF;
export declare type Scalar = number;
export declare type Vector2 = vec2.vec2;
export declare type Vector3 = vec3.vec3;
export declare type Vector4 = vec4;
export declare type NumericalType = Binary | Scalar | Vector2 | Vector3 | Vector4;
