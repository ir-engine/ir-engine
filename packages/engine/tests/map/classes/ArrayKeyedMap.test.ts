import assert from 'assert'
import ArrayKeyedMap from '../../../src/map/classes/ArrayKeyedMap'

describe.only('HashMap', () => {
  it('can store and look up values using an array as a key', () => {
    const sut = new ArrayKeyedMap()

    sut.set([12, 13], 99)
    assert.equal(sut.get([12, 13]), 99)
  })

  it('handles when keys share a prefix', () => {
    const sut = new ArrayKeyedMap()

    sut.set([12, 13, 13], 99)
    sut.set([12, 13, 14], 999)
    assert.equal(sut.get([12, 13, 13]), 99)
    assert.equal(sut.get([12, 13, 14]), 999)
  })

  it('can delete key/value pairs', () => {
    const sut = new ArrayKeyedMap()

    sut.set([12], 99)
    sut.delete([12])

    assert.equal(sut.get([12]), undefined)
  })

  it('exposes an insertion-order key iterator', () => {
    const sut = new ArrayKeyedMap()
    const it = sut.keys()

    sut.set([3], 3)
    sut.set([2], 2)
    sut.set([1], 1)

    assert.deepEqual((it.next().value), [3])
    assert.deepEqual((it.next().value), [2])
    assert.deepEqual((it.next().value), [1])
  })

  it('exposes an insertion-order value iterator', () => {
    const sut = new ArrayKeyedMap()
    const it = sut.keys()

    sut.set([3], 3)
    sut.set([2], 2)
    sut.set([1], 1)

    assert.equal((it.next().value), 3)
    assert.equal((it.next().value), 2)
    assert.equal((it.next().value), 1)
  })
})
