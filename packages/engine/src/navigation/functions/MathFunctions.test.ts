import assert from 'assert'
import { round } from 'lodash'

import { V_000, V_001, V_010, V_100, V_111 } from '../../common/constants/MathConstants'
import { getMovementDirection } from './MathFunctions'

describe('MathFunctions', () => {
  it('returns a normalized vector that points in the direction of the target from the origin, neglecting Y differences', () => {
    assert.deepStrictEqual(getMovementDirection(V_000, V_001.clone().multiplyScalar(2)).toArray(), [0, 0, -1])
    assert.deepStrictEqual(getMovementDirection(V_000, V_010.clone().multiplyScalar(2)).toArray(), [0, 0, 0])
    assert.deepStrictEqual(getMovementDirection(V_000, V_100.clone().multiplyScalar(2)).toArray(), [-1, 0, 0])
    assert.deepStrictEqual(getMovementDirection(V_000, V_001.clone().multiplyScalar(-2)).toArray(), [0, 0, 1])
    assert.deepStrictEqual(getMovementDirection(V_000, V_010.clone().multiplyScalar(-2)).toArray(), [0, 0, 0])
    assert.deepStrictEqual(getMovementDirection(V_000, V_100.clone().multiplyScalar(-2)).toArray(), [1, 0, 0])

    const roundTo3rd = (n: number) => round(n, 3)
    assert.deepStrictEqual(
      getMovementDirection(V_000, V_111.clone().multiplyScalar(2)).toArray().map(roundTo3rd),
      [-0.577, 0, -0.577]
    )
  })
})
