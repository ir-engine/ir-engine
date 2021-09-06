// import './toBeCloseToVector'

// type VectorLike = { x: number; y: number; z: number }

expect.extend({
  toBeCloseToVector(received, expected, tolerance = 5) {
    const limit = 0.5 / Math.pow(10, tolerance)
    const diffX = Math.abs(received.x - expected.x)
    const diffY = Math.abs(received.y - expected.y)
    const diffZ = Math.abs(received.z - expected.z)
    const passX = diffX < limit
    const passY = diffY < limit
    const passZ = diffZ < limit

    const pass = passX && passY && passZ
    if (pass) {
      return {
        message: () =>
          `Too close.
Expected [ ${expected.x}, ${expected.y}, ${expected.z} ]
Received [ ${received.x}, ${received.y}, ${received.z} ]
Diff     [ ${diffX}, ${diffY}, ${diffZ} ]
tolerance ${tolerance}
max diff  ${limit}`,
        pass: true
      }
    } else {
      return {
        message: () =>
          `Not close enough.
Expected [ ${expected.x}, ${expected.y}, ${expected.z} ]
Received [ ${received.x}, ${received.y}, ${received.z} ]
Diff     [ ${diffX}, ${diffY}, ${diffZ} ]
tolerance ${tolerance}
min diff  ${limit}`,
        pass: false
      }
    }
  },

  toBeCloseToQuaternion(received, expected, tolerance = 5) {
    const limit = 0.5 / Math.pow(10, tolerance)
    const angle = angleTo(received, expected)
    const pass = angle < limit

    if (pass) {
      return {
        message: () =>
          `Too close.
Expected [ ${expected.x}, ${expected.y}, ${expected.z}, ${expected.w} ]
Received [ ${received.x}, ${received.y}, ${received.z}, ${received.w} ]
Angle     ${angle}
Tolerance ${tolerance}
Min diff  ${limit}`,
        pass: true
      }
    } else {
      return {
        message: () =>
          `Not close enough.
Expected [ ${expected.x}, ${expected.y}, ${expected.z}, ${expected.w} ]
Received [ ${received.x}, ${received.y}, ${received.z}, ${received.w} ]
Angle     ${angle}
Tolerance ${tolerance}
Min diff  ${limit}`,
        pass: false
      }
    }
  }
})

function angleTo(q1, q2) {
  return 2 * Math.acos(Math.abs(clamp(dot(q1, q2), -1, 1)))
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function dot(a, b) {
  return a._x * b._x + a._y * b._y + a._z * b._z + a._w * b._w
}
