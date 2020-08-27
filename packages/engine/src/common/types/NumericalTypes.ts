import * as THREE from "three"
import { default as vec2, default as vec3, vec4, mat3, mat4 } from 'gl-matrix';

export type Binary = 0 | 1
export type Scalar = number
export type Vector2 = THREE.Vector2 | [number, number] |  vec2.vec2
export type Vector3 = THREE.Vector3 | [number, number, number] | vec3.vec3
export type Vector4 = THREE.Vector4 | [number, number, number, number] | vec4
export type Matrix3 = mat3
export type Matrix4 = mat4

export type NumericalType = Binary | Scalar | Vector2 | Vector3 | Vector4 | Matrix3 | Matrix4
