import ArrayKeyedMap from "../../../src/map/classes/ArrayKeyedMap"
import createUsingCache from "../../../src/map/functions/createUsingCache"

test("createUsingCache", () => {
  const cache = new ArrayKeyedMap<[any, any, any], {r: any, g: any, b: any}>()
  const createColor = (r: any, g: any, b: any) => ({r,g,b})
  const createColorUsingCache = createUsingCache(createColor)

  const r1 = createColorUsingCache(cache, [1, 2, 3])
  const r1a = createColorUsingCache(cache, [1, 2, 3])
  const r2 = createColorUsingCache(cache, [2, 4, 6])

  expect(r1).toBe(r1a)
  expect(r1).toEqual({r:1,g:2,b:3})
  expect(r2).toEqual({r:2,g:4,b:6})
})
