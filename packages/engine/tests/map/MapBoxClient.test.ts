import { createTileIterator, createIntersectTestTileCircle, findCacheCutoffTime, evictLeastRecentlyUsedItems } from '../../src/map/MapBoxClient'

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


describe('evictLeastRecentlyUsedItems', () => {
  const cache = new Map<number, number>()
  for(let i = 0; i < 3; i++) {
    cache.set(i, i)
  }
  evictLeastRecentlyUsedItems(cache, 2)

  const keys = []
  for(const key of cache.keys()) {
    keys.push(key)
  }

  expect(keys).toEqual([1, 2])
})
