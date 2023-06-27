/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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

export {}
