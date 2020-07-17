import vec3, { vec4 } from "gl-matrix"
import vec2 from "gl-matrix"

export type Binary = 0 | 1
export type Scalar = number
export type Vector2 = vec2.vec2
export type Vector3 = vec3.vec3
export type Vector4 = vec4

export type NumericalType = Binary | Scalar | Vector2 | Vector3 | Vector4
