import assert from 'assert'
import zipIterators from '../../../src/common/functions/zipIterators'

describe('zipIterators', () => {
  it('works', () => {
    const itNum = function* () {
      yield 1
      yield 2
      yield 3
    }
    const itAlpha = function* () {
      yield 'a'
      yield 'b'
      yield 'c'
    }
    const itClass = function* () {
      yield Number
      yield Boolean
      yield Object
    }

    const resultArray: any[] = []

    for (const item of zipIterators(itNum(), itAlpha(), itClass())) {
      resultArray.push(item)
    }

    assert.deepEqual(resultArray, [
      [1, 'a', Number],
      [2, 'b', Boolean],
      [3, 'c', Object]
    ])
  })
})
