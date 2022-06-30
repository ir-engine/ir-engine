import { Quaternion, Vector3 } from 'three'

export const PI = Math.PI
export const HALF_PI = PI / 2
export const TAU = Math.PI * 2

export const V_000 = Object.freeze(new Vector3(0, 0, 0))
export const V_100 = Object.freeze(new Vector3(1, 0, 0))
export const V_010 = Object.freeze(new Vector3(0, 1, 0))
export const V_001 = Object.freeze(new Vector3(0, 0, 1))
export const V_111 = Object.freeze(new Vector3(1, 1, 1))

export const Q_IDENTITY = Object.freeze(new Quaternion())
