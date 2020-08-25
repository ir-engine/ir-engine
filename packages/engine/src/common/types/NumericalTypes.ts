import * as THREE from "three"

export type Binary = 0 | 1
export type Scalar = number
export type Vector2 = THREE.Vector2 | [number, number]
export type Vector3 = THREE.Vector3 | [number, number, number]
export type Vector4 = THREE.Vector4 | [number, number, number, number]

export type NumericalType = Binary | Scalar | Vector2 | Vector3 | Vector4
