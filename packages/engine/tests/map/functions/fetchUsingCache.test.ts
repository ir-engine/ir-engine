import MapCache from '../../../src/map/classes/MapCache'
import fetchUsingCache from '../../../src/map/functions/fetchUsingCache'

test('fetchUsingCache', async () => {
  const cache = new MapCache<[any, any, any], { r: any; g: any; b: any }>(50)
  const fetchColor = async (invertRed: boolean, r: any, g: any, b: any) => {
    return Promise.resolve({ r: r * (invertRed ? -1 : 1), g, b })
  }
  const fetchColorUsingCache = fetchUsingCache(fetchColor)

  const r1 = await fetchColorUsingCache(cache, [1, 2, 3], false)
  const r1a = await fetchColorUsingCache(cache, [1, 2, 3], false)
  const r2 = await fetchColorUsingCache(cache, [2, 4, 6], true)

  expect(r1).toEqual({ r: 1, g: 2, b: 3 })
  expect(r1a).toEqual({ r: 1, g: 2, b: 3 })
  expect(r2).toEqual({ r: -2, g: 4, b: 6 })

  expect(cache.get([1, 2, 3])).toEqual({ r: 1, g: 2, b: 3 })
  expect(cache.get([2, 4, 6])).toEqual({ r: -2, g: 4, b: 6 })
})
