import assert from 'assert'

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
