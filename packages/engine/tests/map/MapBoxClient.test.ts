import { createTileIterator, createIntersectTestCellCircle } from '../../src/map/MapBoxClient'

const testCaseSanFrancisco = {
  center: [-122.43931, 37.76492],
  minimumSceneRadius: 2430,
  zoomLevel: 15,
  tiles: [
    [5237, 12663],
    [5238, 12663],
    [5239, 12663],
    [5240, 12663],
    [5237, 12664],
    [5238, 12664],
    [5239, 12664],
    [5240, 12664],
    [5237, 12665],
    [5238, 12665],
    [5239, 12665],
    [5240, 12665],
    [5237, 12666],
    [5238, 12666],
    [5239, 12666],
    [5240, 12666]
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
  const isIntersectCellCircle = createIntersectTestCellCircle(2, 2, 1.25)
  expect(isIntersectCellCircle(0, 0)).toBe(false)
  expect(isIntersectCellCircle(1, 0)).toBe(true)
  expect(isIntersectCellCircle(2, 0)).toBe(true)
  expect(isIntersectCellCircle(3, 0)).toBe(false)

  expect(isIntersectCellCircle(0, 1)).toBe(true)
  expect(isIntersectCellCircle(1, 1)).toBe(true)
  expect(isIntersectCellCircle(2, 1)).toBe(true)
  expect(isIntersectCellCircle(3, 1)).toBe(true)

  expect(isIntersectCellCircle(0, 2)).toBe(true)
  expect(isIntersectCellCircle(1, 2)).toBe(true)
  expect(isIntersectCellCircle(2, 2)).toBe(true)
  expect(isIntersectCellCircle(3, 2)).toBe(true)

  expect(isIntersectCellCircle(0, 3)).toBe(false)
  expect(isIntersectCellCircle(1, 3)).toBe(true)
  expect(isIntersectCellCircle(2, 3)).toBe(true)
  expect(isIntersectCellCircle(3, 3)).toBe(false)
})
