export const PI = 3.14159265359
export const TAU = 6.28318530718

// Used when compressing float values, where the decimal portion of the floating point value
// is multiplied by this number prior to storing the result. Doing this allows
// us to retain three decimal places.
export const FLOAT_PRECISION_MULT = 1000

// If v is the absolute value of the largest quaternion component, the next largest possible component value occurs
// when two components have the same absolute value and the other two components are zero.
// The length of that quaternion (v,v,0,0) is 1, therefore v^2 + v^2 = 1, 2v^2 = 1, v = 1/sqrt(2).
// This means you can encode the smallest three components in [-0.707107,+0.707107] instead of [-1,+1]
// giving more precision with the same number of bits.
export const QUAT_MAX_RANGE = 1 / Math.sqrt(2)
