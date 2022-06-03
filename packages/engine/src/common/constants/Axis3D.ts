// Common readonly 3D Axis definitions

/** X Axis (1,0,0) */
export const X = {
  get x() {
    return 1
  },
  get y() {
    return 0
  },
  get z() {
    return 0
  }
} as any

/** Y Axis (0,1,0) */
export const Y = {
  get x() {
    return 0
  },
  get y() {
    return 1
  },
  get z() {
    return 0
  }
} as any

/** Z Axis (0,0,1) */
export const Z = {
  get x() {
    return 0
  },
  get y() {
    return 0
  },
  get z() {
    return 1
  }
} as any

export const Right = X
export const Up = Y
export const Forward = Z
