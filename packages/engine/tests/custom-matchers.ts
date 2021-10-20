// import { Quaternion, Vector3 } from 'three'

// declare global {
//   namespace jest {
//     interface Matchers<R> {
//       toBeCloseToVector(expected: Vector3, tolerance?: number): R
//       toBeCloseToQuaternion(expected: Quaternion, tolerance?: number): R
//     }
//   }
// }

// expect.extend({
//   toBeCloseToVector(received: Vector3, expected: Vector3, tolerance = 5) {
//     const limit = 0.5 / Math.pow(10, tolerance)
//     const diffX = Math.abs(received.x - expected.x)
//     const diffY = Math.abs(received.y - expected.y)
//     const diffZ = Math.abs(received.z - expected.z)
//     const passX = diffX < limit
//     const passY = diffY < limit
//     const passZ = diffZ < limit

//     const pass = passX && passY && passZ
//     if (pass) {
//       return {
//         message: () =>
//           `Too close.
// Expected [ ${expected.x}, ${expected.y}, ${expected.z} ]
// Received [ ${received.x}, ${received.y}, ${received.z} ]
// Diff     [ ${diffX}, ${diffY}, ${diffZ} ]
// tolerance ${tolerance}
// max diff  ${limit}`,
//         pass: true
//       }
//     } else {
//       return {
//         message: () =>
//           `Not close enough.
// Expected [ ${expected.x}, ${expected.y}, ${expected.z} ]
// Received [ ${received.x}, ${received.y}, ${received.z} ]
// Diff     [ ${diffX}, ${diffY}, ${diffZ} ]
// tolerance ${tolerance}
// min diff  ${limit}`,
//         pass: false
//       }
//     }
//   },

//   toBeCloseToQuaternion(received, expected, tolerance = 5) {
//     const limit = 0.5 / Math.pow(10, tolerance)
//     const angle = received.angleTo(expected)
//     const pass = angle < limit

//     if (pass) {
//       return {
//         message: () =>
//           `Quaternion angle is too close.
// Expected [ ${expected.x}, ${expected.y}, ${expected.z}, ${expected.w} ]
// Received [ ${received.x}, ${received.y}, ${received.z}, ${received.w} ]
// Angle     ${angle}
// Tolerance ${tolerance}
// Min diff  ${limit}`,
//         pass: true
//       }
//     } else {
//       return {
//         message: () =>
//           `Quaternion angle is not close enough.
// Expected [ ${expected.x}, ${expected.y}, ${expected.z}, ${expected.w} ]
// Received [ ${received.x}, ${received.y}, ${received.z}, ${received.w} ]
// Angle     ${angle}
// Tolerance ${tolerance}
// Min diff  ${limit}`,
//         pass: false
//       }
//     }
//   }
// })

// export default undefined
