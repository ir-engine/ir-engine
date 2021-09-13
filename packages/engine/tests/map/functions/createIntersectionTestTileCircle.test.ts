import createIntersectTestTileCircle from '../../../src/map/functions/createIntersectionTestTileCircle'

test('createIntersectTestTileCircle', () => {
  const isIntersectCircleAtTopLeft = createIntersectTestTileCircle(2, 2, Math.hypot(1, 1))
  expect(isIntersectCircleAtTopLeft(0, 0)).toBe(false)
  expect(isIntersectCircleAtTopLeft(1, 0)).toBe(true)
  expect(isIntersectCircleAtTopLeft(2, 0)).toBe(true)
  expect(isIntersectCircleAtTopLeft(3, 0)).toBe(false)

  expect(isIntersectCircleAtTopLeft(0, 1)).toBe(true)
  expect(isIntersectCircleAtTopLeft(1, 1)).toBe(true)
  expect(isIntersectCircleAtTopLeft(2, 1)).toBe(true)
  expect(isIntersectCircleAtTopLeft(3, 1)).toBe(true)

  expect(isIntersectCircleAtTopLeft(0, 2)).toBe(true)
  expect(isIntersectCircleAtTopLeft(1, 2)).toBe(true)
  expect(isIntersectCircleAtTopLeft(2, 2)).toBe(true)
  expect(isIntersectCircleAtTopLeft(3, 2)).toBe(true)

  expect(isIntersectCircleAtTopLeft(0, 3)).toBe(false)
  expect(isIntersectCircleAtTopLeft(1, 3)).toBe(true)
  expect(isIntersectCircleAtTopLeft(2, 3)).toBe(true)
  expect(isIntersectCircleAtTopLeft(3, 3)).toBe(false)

  const isIntersectCircleAtCenter = createIntersectTestTileCircle(1.5, 1.5, Math.hypot(0.5, 0.5))
  expect(isIntersectCircleAtCenter(0, 0)).toBe(false)
  expect(isIntersectCircleAtCenter(1, 0)).toBe(true)
  expect(isIntersectCircleAtCenter(2, 0)).toBe(false)

  expect(isIntersectCircleAtCenter(0, 1)).toBe(true)
  expect(isIntersectCircleAtCenter(1, 1)).toBe(true)
  expect(isIntersectCircleAtCenter(2, 1)).toBe(true)

  expect(isIntersectCircleAtCenter(0, 2)).toBe(false)
  expect(isIntersectCircleAtCenter(1, 2)).toBe(true)
  expect(isIntersectCircleAtCenter(2, 2)).toBe(false)
})
