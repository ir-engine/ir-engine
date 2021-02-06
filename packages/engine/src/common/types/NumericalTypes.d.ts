import * as THREE from "three";
export declare type BinaryType = 0 | 1;
export declare type ScalarType = number;
export declare type Vector2Type = THREE.Vector2 | [number, number];
export declare type Vector3Type = THREE.Vector3 | [number, number, number];
export declare type Vector4Type = THREE.Vector4 | [number, number, number, number];
export declare type Matrix3Type = THREE.Matrix3;
export declare type Matrix4Type = THREE.Matrix4;
export declare type NumericalType = BinaryType | ScalarType | Vector2Type | Vector3Type | Vector4Type | Matrix3Type | Matrix4Type;
