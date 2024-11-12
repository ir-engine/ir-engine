/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { assert } from 'vitest'

const Epsilon = 0.001
export function floatApproxEq(A: number, B: number, epsilon = Epsilon): boolean {
  return Math.abs(A - B) < epsilon
}
export function assertFloatApproxEq(A: number, B: number, epsilon = Epsilon) {
  assert.ok(floatApproxEq(A, B, epsilon), `Numbers are not approximately equal:  ${A} : ${B} : ${A - B}`)
}

export function assertFloatApproxNotEq(A: number, B: number, epsilon = Epsilon) {
  assert.ok(!floatApproxEq(A, B, epsilon), `Numbers are approximately equal:  ${A} : ${B} : ${A - B}`)
}

export function assertVecApproxEq(A, B, elems: number, epsilon = Epsilon) {
  // @note Also used by RigidBodyComponent.test.ts
  assertFloatApproxEq(A.x, B.x, epsilon)
  assertFloatApproxEq(A.y, B.y, epsilon)
  assertFloatApproxEq(A.z, B.z, epsilon)
  if (elems > 3) assertFloatApproxEq(A.w, B.w, epsilon)
}

/**
 * @description
 * Triggers an assert if one or many of the (x,y,z,w) members of `@param A` is not equal to `@param B`.
 * Does nothing for members that are equal */
export function assertVecAnyApproxNotEq(A, B, elems: number, epsilon = Epsilon) {
  // @note Also used by PhysicsSystem.test.ts
  !floatApproxEq(A.x, B.x, epsilon) && assertFloatApproxNotEq(A.x, B.x, epsilon)
  !floatApproxEq(A.y, B.y, epsilon) && assertFloatApproxNotEq(A.y, B.y, epsilon)
  !floatApproxEq(A.z, B.z, epsilon) && assertFloatApproxNotEq(A.z, B.z, epsilon)
  if (elems > 3) !floatApproxEq(A.w, B.w, epsilon) && assertFloatApproxEq(A.w, B.w, epsilon)
}

export function assertVecAllApproxNotEq(A, B, elems: number, epsilon = Epsilon) {
  // @note Also used by RigidBodyComponent.test.ts
  assertFloatApproxNotEq(A.x, B.x, epsilon)
  assertFloatApproxNotEq(A.y, B.y, epsilon)
  assertFloatApproxNotEq(A.z, B.z, epsilon)
  if (elems > 3) assertFloatApproxNotEq(A.w, B.w, epsilon)
}

export function assertMatrixApproxEq(A, B, epsilon = Epsilon) {
  for (let id = 0; id < 16; ++id) {
    assertFloatApproxEq(A.elements[id], B.elements[id], epsilon)
  }
}

export function assertMatrixAllApproxNotEq(A, B, epsilon = Epsilon) {
  for (let id = 0; id < 16; ++id) {
    assertFloatApproxNotEq(A.elements[id], B.elements[id], epsilon)
  }
}

//______________________________________________________________
// @section How to implement a new matcher                      |
// @reference https://vitest.dev/guide/extending-matchers.html  |
//______________________________________________________________|
// import { expect } from 'vitest'
// function matcherTemplate <T>(actual :T, expected :T) {
//   const condition = false
//
//   const pass = condition
//   function message () :string {
//     const { isNot } = this
//     return "SomeMessage" + isNot?".not":""
//   }
//
//   const result = {
//     pass     : pass,
//     message  : message,
//     actual   : actual,
//     expected : expected, }
//   return result
// }
//
// expect.extend({
//   __someExample: matcherTemplate
// })
