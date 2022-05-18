import assert from 'assert'
import ParametricCache from '../../../src/map/classes/ParametricCache'
import TileKey from '../../../src/map/classes/TileKey'
import fetchUsingCache from '../../../src/map/functions/fetchUsingCache'

describe('fetchUsingCache', () => {
  it('works', async () => {
    const cache = new ParametricCache<TileKey, [number, number]>(50)
    const fetchColor = async (_: any, key: TileKey, invert = false) => ([...key].map((i) => invert ? -i : i))
    const fetchColorUsingCache = fetchUsingCache(fetchColor)

    const r1 = await fetchColorUsingCache(cache, {} as any, new TileKey(0, 0))
    const r2 = await fetchColorUsingCache(cache, {} as any, new TileKey(0, 0))
    const r3 = await fetchColorUsingCache(cache, {} as any, new TileKey(1, 1), true)

    assert.deepEqual(r1, [0, 0])
    assert(r1 === r2)
    assert.deepEqual(r3, [-1, -1])

    assert.deepEqual(cache.get(new TileKey(0, 0)), [0, 0])
    assert.deepEqual(cache.get(new TileKey(1, 1)), [-1, -1])
  })
})
