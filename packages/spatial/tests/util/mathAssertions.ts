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

import { Color, ColorRepresentation } from 'three'
export function getColorHex(c: ColorRepresentation) {
  return new Color(c).getHex()
}

const Epsilon = 0.001

/**
 * @description Returns whether or not `@param val` is a primitive type or not.
 * @note Replaces the deprecated function `util.isPrimitive`  */
export function isPrimitive<T>(val: T): boolean {
  return (typeof val !== 'object' && typeof val !== 'function') || val === null
}

/**
 * @description Returns whether or not A and B are deeply equal to each other
 * @note Uses ES6 features  */
export function isDeepEqual(A: any, B: any): boolean {
  if (A === B) return true // Same reference or value. No need to compare any further
  if (isPrimitive(A) && isPrimitive(B)) return A === B // Compare primitives
  if (Object.keys(A).length !== Object.keys(B).length) return false // Check for different amount of keys
  for (let key in A) {
    // Compare objects with same number of keys
    if (!(key in B)) return false // B doesn't have this prop
    if (!isDeepEqual(A[key], B[key])) return false // Recursive case
  }
  return true // Otherwise they are equal
}

/** @description Returns whethere or not the given `@param arr` has duplicate values. */
export function isArrayWithDuplicates(arr: any[]): boolean {
  return new Set(arr).size !== arr.length
}

/**
 * @description Returns whether or not `@param A` and `@param B` are approximately equal, using `@param epsilon` as the margin of error.
 * @note Will also be true when both A and B are not finite. */
function floatApproxEq(A: number, B: number, epsilon = Epsilon): boolean {
  if (!Number.isFinite(A) || !Number.isFinite(B)) {
    return !Number.isFinite(A) && !Number.isFinite(B) ? true : false
  } else return Math.abs(A - B) < epsilon
}

/**
 * @description
 * Triggers an assert when `@param A` and `@param B` are not approximately equal, using `@param epsilon` as the margin of error. */
export function assertFloatApproxEq(A: number, B: number, epsilon = Epsilon) {
  assert.equal(floatApproxEq(A, B, epsilon), true, `Numbers are not approximately equal:  ${A} : ${B} : ${A - B}`)
}

/**
 * @description
 * Triggers an assert when `@param A` and `@param B` are approximately equal, using `@param epsilon` as the margin of error. */
export function assertFloatApproxNotEq(A: number, B: number, epsilon = Epsilon) {
  assert.equal(floatApproxEq(A, B, epsilon), false, `Numbers are approximately equal:  ${A} : ${B} : ${A - B}`)
}

/**
 * @description
 * Triggers an assert when one or many of the (x,y,z,w) members of `@param A` is not equal to `@param B`. */
export function assertVecApproxEq(A, B, elems: number, epsilon = Epsilon) {
  assertFloatApproxEq(A.x, B.x, epsilon)
  assertFloatApproxEq(A.y, B.y, epsilon)
  assertFloatApproxEq(A.z, B.z, epsilon)
  if (elems > 3) assertFloatApproxEq(A.w, B.w, epsilon)
}

/**
 * @description
 * Triggers an assert when one or many of the members of `@param A` is not equal to `@param B`.
 * Does nothing for members that are equal */
export function assertVecAnyApproxNotEq(A, B, elems: number, epsilon = Epsilon) {
  !floatApproxEq(A.x, B.x, epsilon) && assertFloatApproxNotEq(A.x, B.x, epsilon)
  !floatApproxEq(A.y, B.y, epsilon) && assertFloatApproxNotEq(A.y, B.y, epsilon)
  !floatApproxEq(A.z, B.z, epsilon) && assertFloatApproxNotEq(A.z, B.z, epsilon)
  if (elems > 3) !floatApproxEq(A.w, B.w, epsilon) && assertFloatApproxNotEq(A.w, B.w, epsilon)
}

/**
 * @description
 * Triggers an assert when all the members of `@param A` are equal to `@param B`. */
export function assertVecAllApproxNotEq(A, B, elems: number, epsilon = Epsilon) {
  assertFloatApproxNotEq(A.x, B.x, epsilon)
  assertFloatApproxNotEq(A.y, B.y, epsilon)
  assertFloatApproxNotEq(A.z, B.z, epsilon)
  if (elems > 3) assertFloatApproxNotEq(A.w, B.w, epsilon)
}

/**
 * @description
 * Triggers an assert when all the members of `@param A` are not equal to `@param B`. */
export function assertArrayEqual<T>(A: Array<T>, B: Array<T>, err = 'Arrays are not equal') {
  assert.equal(A.length, B.length, err + ': Their length is not the same')
  for (let id = 0; id < A.length && id < B.length; id++) {
    assert.deepEqual(A[id], B[id], err + `: Their item[${id}] is not the same : ${A[id]} : ${B[id]}`)
  }
}

/**
 * @description
 * Triggers an assert when all the members of `@param A` are equal to `@param B`. */
export function assertArrayAllNotEq<T>(A: Array<T>, B: Array<T>, err = 'Arrays are equal') {
  for (let id = 0; id < A.length && id < B.length; id++) {
    assert.notDeepEqual(A[id], B[id], err)
  }
}

/**
 * @description
 * Triggers an assert when one or many of the members of `@param A` is not equal to `@param B`.
 * Does not trigger an assert for members that are equal  */
export function assertArrayAnyNotEq<T>(A: Array<T>, B: Array<T>, err = 'One of the elements of the Arrays are equal') {
  for (let id = 0; id < A.length && id < B.length; id++) {
    !isDeepEqual(A[id], B[id]) && assert.notDeepEqual(A[id], B[id], err)
  }
}

/**
 * @description
 * Triggers an assertion when `@param arr` is an array that has no duplicate elements */
export function assertArrayHasDuplicates<T>(arr: Array<T>) {
  assert.equal(isArrayWithDuplicates(arr), true)
}

/**
 * @description
 * Triggers an assertion when `@param arr` is an array that has duplicate elements */
export function assertArrayHasNoDuplicates<T>(arr: Array<T>) {
  assert.equal(isArrayWithDuplicates(arr), false)
}

/**
 * @description
 * Triggers an assertion when all the members of `@param A` are equal to `@param B`. */
export function assertMatrixApproxEq(A, B, epsilon = Epsilon) {
  for (let id = 0; id < 16; ++id) {
    assertFloatApproxEq(A.elements[id], B.elements[id], epsilon)
  }
}

/**
 * @description
 * Triggers an assertion when all the members of `@param A` are equal to `@param B`. */
export function assertMatrixAllApproxNotEq(A, B, epsilon = Epsilon) {
  for (let id = 0; id < 16; ++id) {
    assertFloatApproxNotEq(A.elements[id], B.elements[id], epsilon)
  }
}

/**
 * @description
 * Triggers an assertion when the {@link Color} represented by `@param A` is not the same as `@param B`. */
export function assertColorEqual(l: ColorRepresentation, r: ColorRepresentation) {
  assert.equal(getColorHex(l), getColorHex(r))
}

/**
 * @description
 * Triggers an assertion when the {@link Color} represented by `@param A` is the same as `@param B`. */
export function assertColorNotEqual(l: ColorRepresentation, r: ColorRepresentation) {
  assert.notEqual(getColorHex(l), getColorHex(r))
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
