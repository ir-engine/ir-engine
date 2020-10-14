import { Vector2, Vector3, Vector4, Matrix3, Matrix4 } from "three";

export type BinaryType = 0 | 1
export type ScalarType = number
export type Vector2Type = Vector2 | [number, number]
export type Vector3Type = Vector3 | [number, number, number]
export type Vector4Type = Vector4 | [number, number, number, number]
export type Matrix3Type = Matrix3
export type Matrix4Type = Matrix4

export type NumericalType = BinaryType | ScalarType | Vector2Type | Vector3Type | Vector4Type | Matrix3Type | Matrix4Type
