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

import * as npmAssert from 'assert'
import { Color, ColorRepresentation } from 'three'

/**
 * @fileoverview Assertion utilities for unit tests
 */

type AssertFn = (val: unknown, msg?: Message) => asserts val

/**
 *
 * @description Extension of `npm/assert`
 *
 * @function `assert(val, msg?)`:
 * Triggers an assertion if `@param val` does not evaluate to a truthy value
 *
 * @module `assert`:
 * Describes assertion utilities for use in unit tests.
 *
 * Extends `import assert from 'assert'`
 * - `assert()` becomes `npm/assert.equal(Boolean(val), true)`, so that error messages are clearer.
 *   _(note: Does not double-serve as null/undefined removal. Use `assertOk(val)` for that)_
 * - Other `npm/assert` functions preserve their normal behavior.
 *
 * Also Implements new math and array assertions.
 * */
function assert<T>(val: T, msg?: Message): void {
  assert.equal(is.truthy(val), true, msg)
}
export const assertOk: AssertFn = npmAssert.ok

/* @note
 * Extends the assert function with a harcoded list of the most commonly used assertions in `npm/assert`
 * Add any missing functions to the list below when necessary */
assert.equal = npmAssert.equal
assert.notEqual = npmAssert.notEqual
assert.deepEqual = npmAssert.deepEqual
assert.notDeepEqual = npmAssert.notDeepEqual
assert.fail = npmAssert.fail
assert.throws = npmAssert.throws
assert.doesNotThrow = npmAssert.doesNotThrow
assert.match = npmAssert.match
assert.doesNotMatch = npmAssert.doesNotMatch
assert.rejects = npmAssert.rejects
assert.doesNotReject = npmAssert.doesNotReject

/**
 * @description Default epsilon value used to evaluate if a float value approximately equals another */
export const Epsilon = 0.001

/**
 * @description Describes value checking utilities that return (true/false) when the condition is met. */
export const is = {
  /**
   * @description Returns true if `@param val` evaluates to a truthy value */
  truthy(val: any) {
    return Boolean(val)
  },

  /**
   * @description Returns true if `@param val` evaluates to a falsy value */
  falsy(val: any) {
    return !is.truthy(val)
  },

  /**
   * @description Returns whether or not `@param A` and `@param B` are approximately equal, using `@param epsilon` as the margin of error.
   * @note Will also be true when both A and B are not finite. */
  floatApproxEq(A: number, B: number, epsilon = Epsilon): boolean {
    if (!Number.isFinite(A) || !Number.isFinite(B)) {
      return !Number.isFinite(A) && !Number.isFinite(B) ? true : false
    } else return Math.abs(A - B) < epsilon
  },

  /**
   * @description Returns whether or not `@param val` is a primitive type or not.
   * @note Replaces the deprecated function `util.isPrimitive`  */
  primitive<T>(val: T): boolean {
    return (typeof val !== 'object' && typeof val !== 'function') || val === null
  },

  /**
   * @description Returns whether or not A and B are deeply equal to each other
   * @note Uses ES6 features  */
  deepEqual(A: any, B: any): boolean {
    if (A === B) return true // Same reference or value. No need to compare any further
    if (is.primitive(A) && is.primitive(B)) return A === B // Compare primitives
    if (Object.keys(A).length !== Object.keys(B).length) return false // Check for different amount of keys
    for (const key in A) {
      // Compare objects with same number of keys
      if (!(key in B)) return false // B doesn't have this prop
      if (!is.deepEqual(A[key], B[key])) return false // Recursive case
    }
    return true // Otherwise they are equal
  },

  /** @description Returns whether or not the given `@param arr` is an array that has duplicate values. */
  arrayWithDuplicates<T>(arr: T): boolean {
    return Array.isArray(arr) && new Set(arr).size !== arr.length
  }
} //:: is

/**
 * @description Describes the valid shape of messages accepted by all assertion functions. */
type Message = string | Error | undefined

/**
 * @description Triggers an assertion if `@param val` does not evaluate to a truthy value */
assert.truthy = (val: any, msg?: Message): void => {
  assert.equal(is.truthy(val), true, msg)
}

/**
 * @description Triggers an assertion if `@param val` does not evaluate to a falsy value */
assert.falsy = (val: any, msg?: Message): void => {
  assert.equal(is.falsy(val), true, msg)
}

/**
 * @description Triggers an assertion if `@param val` does not evaluate to a truthy value
 * @note
 * Overrides the default `assert.ok` function, so that error messages are clearer.
 * Use `assertOk(val)` to access the old behavior */
assert.ok = (val: any, msg?: Message): void => {
  assert.equal(is.truthy(val), true, msg)
}

/**
 * @description Describes floating point `number` assertion utilities for use in unit tests. */
assert.float = {
  /**
   * @description
   * Triggers an assertion when `@param A` and `@param B` are not approximately equal, using `@param epsilon` as the margin of error. */
  approxEq(A: number, B: number, epsilon = Epsilon) {
    assert.truthy(is.floatApproxEq(A, B, epsilon), `Numbers are not approximately equal:  ${A} : ${B} : ${A - B}`)
  },

  /**
   * @description
   * Triggers an assertion when `@param A` and `@param B` are approximately equal, using `@param epsilon` as the margin of error. */
  approxNotEq(A: number, B: number, epsilon = Epsilon) {
    assert.truthy(!is.floatApproxEq(A, B, epsilon), `Numbers are approximately equal:  ${A} : ${B} : ${A - B}`)
  }
} //:: assert.float

/**
 * @description Describes `Vector{N}` assertion utilities for use in unit tests. */
assert.vec = {
  /**
   * @description
   * Triggers an assertion when one or many of the members of `@param A` is not equal to `@param B`. */
  approxEq(A, B, elems: number, epsilon = Epsilon) {
    assert.float.approxEq(A.x, B.x, epsilon)
    assert.float.approxEq(A.y, B.y, epsilon)
    assert.float.approxEq(A.z, B.z, epsilon)
    if (elems > 3) assert.float.approxEq(A.w, B.w, epsilon)
  },

  /**
   * @description
   * Triggers an assertion if one or many of the members of `@param A` is not equal to `@param B`.
   * Does nothing for members that are equal */
  anyApproxNotEq(A, B, elems: number, epsilon = Epsilon) {
    // @note Also used by PhysicsSystem.test.ts
    !is.floatApproxEq(A.x, B.x, epsilon) && assert.float.approxNotEq(A.x, B.x, epsilon)
    !is.floatApproxEq(A.y, B.y, epsilon) && assert.float.approxNotEq(A.y, B.y, epsilon)
    !is.floatApproxEq(A.z, B.z, epsilon) && assert.float.approxNotEq(A.z, B.z, epsilon)
    if (elems > 3) !is.floatApproxEq(A.w, B.w, epsilon) && assert.float.approxNotEq(A.w, B.w, epsilon)
  },

  /**
   * @description
   * Triggers an assert when all the members of `@param A` are equal to `@param B`. */
  allApproxNotEq(A, B, elems: number, epsilon = Epsilon) {
    // @note Also used by RigidBodyComponent.test.ts
    assert.float.approxNotEq(A.x, B.x, epsilon)
    assert.float.approxNotEq(A.y, B.y, epsilon)
    assert.float.approxNotEq(A.z, B.z, epsilon)
    if (elems > 3) assert.float.approxNotEq(A.w, B.w, epsilon)
  }
} //:: assert.vec

/**
 * @description Describes `Matrix{N}` assertion utilities for use in unit tests. */
assert.matrix = {
  /**
   * @description
   * Triggers an assert when one of the members of `@param A` is not equal to `@param B`. */
  approxEq(A, B, epsilon = Epsilon) {
    for (let id = 0; id < 16; ++id) {
      assert.float.approxEq(A.elements[id], B.elements[id], epsilon)
    }
  },

  /**
   * @description
   * Triggers an assert when one of the members of `@param A` is equal to `@param B`. */
  allApproxNotEq(A, B, epsilon = Epsilon) {
    for (let id = 0; id < 16; ++id) {
      assert.float.approxNotEq(A.elements[id], B.elements[id], epsilon)
    }
  }
} //:: assert.matrix

/**
 * @description Describes `Array` assertion utilities for use in unit tests. */
assert.array = {
  /**
   * @description
   * Triggers an assert when any of the members of `@param A` are not equal to `@param B`. */
  eq<T>(A: Array<T>, B: Array<T>, err = 'Arrays are not equal') {
    assert.equal(A.length, B.length, err + ': Their length is not the same')
    for (let id = 0; id < A.length && id < B.length; id++) {
      assert.deepEqual(A[id], B[id], err + `: Their item[${id}] is not the same : ${A[id]} : ${B[id]}`)
    }
  },

  /**
   * @description
   * Triggers an assert when all the members of `@param A` are equal to `@param B`. */
  allNotEq<T>(A: Array<T>, B: Array<T>, err = 'Arrays are equal') {
    for (let id = 0; id < A.length && id < B.length; id++) {
      assert.notDeepEqual(A[id], B[id], err)
    }
  },

  /**
   * @description
   * Triggers an assert when one or many of the members of `@param A` is not equal to `@param B`.
   * Does not trigger an assert for members that are equal  */
  anyNotEq<T>(A: Array<T>, B: Array<T>, err = 'One of the elements of the Arrays are equal') {
    for (let id = 0; id < A.length && id < B.length; id++) {
      !is.deepEqual(A[id], B[id]) && assert.notDeepEqual(A[id], B[id], err)
    }
  },

  /**
   * @description
   * Triggers an assert when `@param arr` has no duplicate members */
  hasDuplicates<T>(arr: Array<T>, msg?: Message) {
    assert.truthy(is.arrayWithDuplicates(arr), msg)
  },

  /**
   * @description
   * Triggers an assert when `@param arr` has duplicate members */
  hasNoDuplicates<T>(arr: Array<T>, msg?: Message) {
    assert.truthy(!is.arrayWithDuplicates(arr), msg)
  }
} //:: assert.array

function getColorHex(c: ColorRepresentation) {
  return new Color(c).getHex()
}

/**
 * @description Describes `threejs/Color` assertion utilities for use in unit tests. */
assert.color = {
  /**
   * @description
   * Triggers an assertion when the colors represented by `@param A` and `@param B` are not equal */
  eq(A: ColorRepresentation, B: ColorRepresentation) {
    assert.equal(getColorHex(A), getColorHex(B))
  },

  /**
   * @description
   * Triggers an assertion when the colors represented by `@param A` and `@param B` are equal */
  notEq(A: ColorRepresentation, B: ColorRepresentation) {
    assert.notEqual(getColorHex(A), getColorHex(B))
  }
}

export default assert
