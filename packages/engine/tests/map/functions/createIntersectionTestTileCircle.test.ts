import assert from 'assert'
import createIntersectTestTileCircle from '../../../src/map/functions/createIntersectionTestTileCircle'

describe('createIntersectTestTileCircle', () => {
  it('works', () => {
    const isIntersectCircleAtTopLeft = createIntersectTestTileCircle(2, 2, Math.hypot(1, 1))
    assert(isIntersectCircleAtTopLeft(0, 0) === false)
    assert(isIntersectCircleAtTopLeft(1, 0) === true)
    assert(isIntersectCircleAtTopLeft(2, 0) === true)
    assert(isIntersectCircleAtTopLeft(3, 0) === false)

    assert(isIntersectCircleAtTopLeft(0, 1) === true)
    assert(isIntersectCircleAtTopLeft(1, 1) === true)
    assert(isIntersectCircleAtTopLeft(2, 1) === true)
    assert(isIntersectCircleAtTopLeft(3, 1) === true)

    assert(isIntersectCircleAtTopLeft(0, 2) === true)
    assert(isIntersectCircleAtTopLeft(1, 2) === true)
    assert(isIntersectCircleAtTopLeft(2, 2) === true)
    assert(isIntersectCircleAtTopLeft(3, 2) === true)

    assert(isIntersectCircleAtTopLeft(0, 3) === false)
    assert(isIntersectCircleAtTopLeft(1, 3) === true)
    assert(isIntersectCircleAtTopLeft(2, 3) === true)
    assert(isIntersectCircleAtTopLeft(3, 3) === false)

    const isIntersectCircleAtCenter = createIntersectTestTileCircle(1.5, 1.5, Math.hypot(0.5, 0.5))
    assert(isIntersectCircleAtCenter(0, 0) === false)
    assert(isIntersectCircleAtCenter(1, 0) === true)
    assert(isIntersectCircleAtCenter(2, 0) === false)

    assert(isIntersectCircleAtCenter(0, 1) === true)
    assert(isIntersectCircleAtCenter(1, 1) === true)
    assert(isIntersectCircleAtCenter(2, 1) === true)

    assert(isIntersectCircleAtCenter(0, 2) === false)
    assert(isIntersectCircleAtCenter(1, 2) === true)
    assert(isIntersectCircleAtCenter(2, 2) === false)
  })
})
