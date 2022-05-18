export const PI = 3.14159265359
export const TAU = 6.28318530718

// Used when compressing float values, where the decimal portion of the floating point value
// is multiplied by this number prior to storing the result in an Int16. Doing this allows
// us to retain five decimal places, which for many purposes is more than adequate.
export const FLOAT_PRECISION_MULT = 10000
