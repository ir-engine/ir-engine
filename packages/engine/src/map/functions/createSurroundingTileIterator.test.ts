import createSurroundingTileIterator from '../../../src/map/functions/createSurroundingTileIterator';
import assert from 'assert'
import TileKey from '../../../src/map/classes/TileKey';

// TODO start with center tiles and work outward
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

describe('createSurroundingTileIterator', () => {
  it('returns the tile coordinates within `minimumSceneRadius` from `center` at the given `zoomLevel`  ', () => {
    const results = [] as TileKey[]

    for (const coord of createSurroundingTileIterator(
      testCaseSanFrancisco.center,
      testCaseSanFrancisco.minimumSceneRadius,
      testCaseSanFrancisco.zoomLevel
    )) {
      results.push(coord)
    }

    assert.deepEqual(results.map((r) => [...r]), testCaseSanFrancisco.tiles)
  })
})

