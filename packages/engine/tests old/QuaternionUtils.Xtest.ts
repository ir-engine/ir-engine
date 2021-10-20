// function degToRad(deg) {
//   return (deg * Math.PI) / 180
// }

// function radToDegree(rad) {
//   return (rad * 180) / Math.PI
// }

// function thetaAndVectorToGLQuat(theta: number, v: number[]): number[] {
//   const cosT = Math.cos(degToRad(theta))
//   const sinT = Math.sin(degToRad(theta))
//   return [sinT * v[0], sinT * v[1], sinT * v[2], cosT]
// }

// interface angles {
//   pitch: number
//   roll: number
//   yaw: number
// }

// const tests = [
//   {
//     theta: 0,
//     expected: 0
//   },
//   {
//     theta: 45,
//     expected: Math.PI / 2
//   },
//   {
//     theta: 90,
//     expected: Math.PI
//   },
//   {
//     theta: 180,
//     expected: 0
//   },
//   {
//     theta: -45,
//     expected: Math.PI / 2
//   },
//   {
//     theta: -180,
//     expected: 0
//   }
// ]

// // // TODO: get tests with negative thetas to pass
// // // TODO: get tests that expect 0 but outpu ~Pi to pass
// // describe('QuaternionUtils tests', () => {
// //   tests.forEach(o => {
// //     const adjustedQuat: number[] = thetaAndVectorToGLQuat(o.theta, [1, 0, 0])
// //     test(`pitch of cos(${o.theta}) + sin(${o.theta}) * (1i + 0j + 0k) is ${radToDegree(o.expected)}`, () => {
// //         expect(QuatUtils.pitchFromQuaternion(adjustedQuat)).toBeCloseTo(o.expected);
// //       });
// //     test(`roll of cos(${o.theta}) + sin(${o.theta}) * (1i + 0j + 0k) is 0`, () => {
// //         expect(QuatUtils.rollFromQuaternion(adjustedQuat)).toBeCloseTo(0);
// //       });
// //     test(`yaw of cos(${o.theta}) + sin(${o.theta}) * (1i + 0j + 0k) is 0`, () => {
// //         expect(QuatUtils.yawFromQuaternion(adjustedQuat)).toBeCloseTo(0);
// //       });
// //   })

// //   tests.forEach(o => {
// //     const adjustedQuat: number[] = thetaAndVectorToGLQuat(o.theta, [0, 1, 0])
// //     test(`pitch of cos(${o.theta}) + sin(${o.theta}) * (0i + 1j + 0k) is 0`, () => {
// //       expect(QuatUtils.pitchFromQuaternion(adjustedQuat)).toBeCloseTo(0);
// //     });
// //     test(`roll of cos(${o.theta}) + sin(${o.theta}) * (0i + 1j + 0k) is ${radToDegree(o.expected)}`, () => {
// //         expect(QuatUtils.rollFromQuaternion(adjustedQuat)).toBeCloseTo(o.expected);
// //       });
// //     test(`yaw of cos(${o.theta}) + sin(${o.theta}) * (0i + 1j + 0k) is 0`, () => {
// //         expect(QuatUtils.yawFromQuaternion(adjustedQuat)).toBeCloseTo(0);
// //       });
// //   })

// //   tests.forEach(o => {
// //     const adjustedQuat: number[] = thetaAndVectorToGLQuat(o.theta, [0, 0, 1])
// //     test(`pitch of cos(${o.theta}) + sin(${o.theta}) * (0i + 0j + 1k) is 0`, () => {
// //       expect(QuatUtils.pitchFromQuaternion(adjustedQuat)).toBeCloseTo(0);
// //     });
// //     test(`roll of cos(${o.theta}) + sin(${o.theta}) * (0i + 0j + 1k) is 0`, () => {
// //         expect(QuatUtils.rollFromQuaternion(adjustedQuat)).toBeCloseTo(0);
// //       });
// //     test(`yaw of cos(${o.theta}) + sin(${o.theta}) * (0i + 0j + 1k) is ${radToDegree(o.expected)}`, () => {
// //         expect(QuatUtils.yawFromQuaternion(adjustedQuat)).toBeCloseTo(o.expected);
// //       });
// //   })
// // })
