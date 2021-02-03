import * as THREE from "three";

export type BinaryType = 0 | 1
export type ScalarType = number
export type Vector2Type = THREE.Vector2 | [number, number]
export type Vector3Type = THREE.Vector3 | [number, number, number]
export type Vector4Type = THREE.Vector4 | [number, number, number, number]
export type Matrix3Type = THREE.Matrix3
export type Matrix4Type = THREE.Matrix4

export type NumericalType = BinaryType | ScalarType | Vector2Type | Vector3Type | Vector4Type | Matrix3Type | Matrix4Type
