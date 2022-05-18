import assert from 'assert'
import updateKeyVal from '../../../src/common/functions/updateKeyVal'

describe('updateKeyVal', () => {
  it('works', () => {
    const map = new Map<string, number>()

    const add = updateKeyVal(
      map.get.bind(map),
      map.set.bind(map),
      (value: number, addend: number) => {
        return value + addend
      },
      0
    )

    add('beer', 2)
    add('beer', 3)
    add('hotdog', 7)
    add('hotdog', -2)

    assert(map.get('beer') === 5)
    assert(map.get('hotdog') === 5)
  })
})
