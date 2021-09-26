import assert from 'assert'
import ArrayKeyedMap from '../../../src/map/classes/ArrayKeyedMap'
import createUsingCache from '../../../src/map/functions/createUsingCache'

describe('createUsingCache', () => {
  it('works', () => {
    const cache = new ArrayKeyedMap<[any, any, any], { r: any; g: any; b: any }>()
    const createColor = (invertRed: boolean, r: any, g: any, b: any) => ({ r: r * (invertRed ? -1 : 1), g, b })
    const createColorUsingCache = createUsingCache(createColor)

    const r1 = createColorUsingCache(cache, [1, 2, 3], false)
    const r1a = createColorUsingCache(cache, [1, 2, 3], false)
    const r2 = createColorUsingCache(cache, [2, 4, 6], true)

    assert.deepEqual(r1, r1a)
    assert.deepEqual(r1, { r: 1, g: 2, b: 3 })
    assert.deepEqual(r2, { r: -2, g: 4, b: 6 })
  })
})
