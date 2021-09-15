import ArrayKeyedMap from "../../../src/map/classes/ArrayKeyedMap"
import fetchUsingCache from "../../../src/map/functions/fetchUsingCache"

test("fetchUsingCache", async () => {
  const cache = new ArrayKeyedMap<[any, any, any], {r: any, g: any, b: any}>()
  const fetchColor = (r: any, g: any, b: any) => Promise.resolve({r,g,b})
  const fetchColorUsingCache = fetchUsingCache(fetchColor)

  const r1 = await fetchColorUsingCache(cache, [1, 2, 3])
  const r1a = await fetchColorUsingCache(cache, [1, 2, 3])
  const r2 = await fetchColorUsingCache(cache, [2, 4, 6])

  expect(r1).toBe(r1a)
  expect(r1).toEqual({r:1,g:2,b:3})
  expect(r2).toEqual({r:2,g:4,b:6})
})
