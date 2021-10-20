import assert from 'assert'
import MapCache from '../../../src/map/classes/MapCache'
import fetchUsingCache from '../../../src/map/functions/fetchUsingCache'

describe('fetchUsingCache', () => {
  it('works', async () => {
    const cache = new MapCache<[any, any, any], { r: any; g: any; b: any }>(50)
    const fetchColor = async (invertRed: boolean, r: any, g: any, b: any) => {
      return Promise.resolve({ r: r * (invertRed ? -1 : 1), g, b })
    }
    const fetchColorUsingCache = fetchUsingCache(fetchColor)

    const r1 = await fetchColorUsingCache(cache, [1, 2, 3], false)
    const r1a = await fetchColorUsingCache(cache, [1, 2, 3], false)
    const r2 = await fetchColorUsingCache(cache, [2, 4, 6], true)

    assert.deepEqual(r1, { r: 1, g: 2, b: 3 })
    assert.deepEqual(r1a, { r: 1, g: 2, b: 3 })
    assert.deepEqual(r2, { r: -2, g: 4, b: 6 })

    assert.deepEqual(cache.get([1, 2, 3]), { r: 1, g: 2, b: 3 })
    assert.deepEqual(cache.get([2, 4, 6]), { r: -2, g: 4, b: 6 })
  })
})
