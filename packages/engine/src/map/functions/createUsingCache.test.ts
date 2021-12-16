import assert from 'assert'
import ParametricCache from '../../../src/map/classes/ParametricCache'
import TileKey from '../../../src/map/classes/TileKey'
import createUsingCache from '../../../src/map/functions/createUsingCache'

describe('createUsingCache', () => {
  it('works', () => {
    const cache = new ParametricCache<TileKey, [number, number]>(3)
    const createColor = (_:any, key: TileKey, invert = false) => ([...key].map((i) => invert ? -i : i))
    const createColorUsingCache = createUsingCache(createColor)

    const r1 = createColorUsingCache(cache, {} as any, new TileKey(0, 0))
    const r2 = createColorUsingCache(cache, {} as any, new TileKey(0, 0))
    const r3 = createColorUsingCache(cache, {} as any, new TileKey(1, 1), true)

    assert.deepEqual(r1, [0, 0])
    assert(r1 === r2)
    assert.deepEqual(r3, [-1, -1])
  })
})
