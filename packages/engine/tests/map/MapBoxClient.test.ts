import { createTileIterator, createIntersectTestCellCircle } from '../../src/map/MapBoxClient'

const testCaseSanFrancisco = {
  center: [-122.4372, 37.76644],
  minimumSceneRadius: 2430,
  zoomLevel: 15,
  tiles: [
    [5238, 12664],
    [5239, 12664],
    [5240, 12664],
    [5237, 12665],
    [5238, 12665],
    [5239, 12665],
    [5240, 12665],
    [5241, 12665],
    [5237, 12666],
    [5238, 12666],
    [5239, 12666],
    [5240, 12666],
    [5241, 12666],
    [5237, 12667],
    [5238, 12667],
    [5239, 12667],
    [5240, 12667],
    [5241, 12667],
    [5238, 12668],
    [5239, 12668],
    [5240, 12668]
  ]
}

describe('createTileIterator', () => {
  it('returns the tile coordinates within `minimumSceneRadius` from `center` at the given `zoomLevel`', () => {
    const results = []

    for (const coord of createTileIterator(
      testCaseSanFrancisco.center,
      testCaseSanFrancisco.minimumSceneRadius,
      testCaseSanFrancisco.zoomLevel
    )) {
      results.push(coord)
    }

    expect(results).toEqual(testCaseSanFrancisco.tiles)
  })
})

test('createIntersectTestCellCircle', () => {
  const isIntersectCellCircleAtTopLeft = createIntersectTestCellCircle(2, 2, Math.hypot(1, 1))
  expect(isIntersectCellCircleAtTopLeft(0, 0)).toBe(false)
  expect(isIntersectCellCircleAtTopLeft(1, 0)).toBe(true)
  expect(isIntersectCellCircleAtTopLeft(2, 0)).toBe(true)
  expect(isIntersectCellCircleAtTopLeft(3, 0)).toBe(false)

  expect(isIntersectCellCircleAtTopLeft(0, 1)).toBe(true)
  expect(isIntersectCellCircleAtTopLeft(1, 1)).toBe(true)
  expect(isIntersectCellCircleAtTopLeft(2, 1)).toBe(true)
  expect(isIntersectCellCircleAtTopLeft(3, 1)).toBe(true)

  expect(isIntersectCellCircleAtTopLeft(0, 2)).toBe(true)
  expect(isIntersectCellCircleAtTopLeft(1, 2)).toBe(true)
  expect(isIntersectCellCircleAtTopLeft(2, 2)).toBe(true)
  expect(isIntersectCellCircleAtTopLeft(3, 2)).toBe(true)

  expect(isIntersectCellCircleAtTopLeft(0, 3)).toBe(false)
  expect(isIntersectCellCircleAtTopLeft(1, 3)).toBe(true)
  expect(isIntersectCellCircleAtTopLeft(2, 3)).toBe(true)
  expect(isIntersectCellCircleAtTopLeft(3, 3)).toBe(false)

  const isIntersectCellCircleAtCenter = createIntersectTestCellCircle(1.5, 1.5, Math.hypot(0.5, 0.5))
  expect(isIntersectCellCircleAtCenter(0, 0)).toBe(false)
  expect(isIntersectCellCircleAtCenter(1, 0)).toBe(true)
  expect(isIntersectCellCircleAtCenter(2, 0)).toBe(false)

  expect(isIntersectCellCircleAtCenter(0, 1)).toBe(true)
  expect(isIntersectCellCircleAtCenter(1, 1)).toBe(true)
  expect(isIntersectCellCircleAtCenter(2, 1)).toBe(true)

  expect(isIntersectCellCircleAtCenter(0, 2)).toBe(false)
  expect(isIntersectCellCircleAtCenter(1, 2)).toBe(true)
  expect(isIntersectCellCircleAtCenter(2, 2)).toBe(false)
})
