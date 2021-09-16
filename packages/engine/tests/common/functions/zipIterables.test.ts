import zipIterators from '../../../src/common/functions/zipIterators'

test("zipIterators", () => {
  const itNum = function*() {
    yield 1
    yield 2
    yield 3
  }
  const itAlpha = function*() {
    yield 'a'
    yield 'b'
    yield 'c'
  }
  const itClass = function*() {
    yield Number
    yield Boolean
    yield Object
  }

  const resultArray = []

  for(const item of zipIterators(itNum(), itAlpha(), itClass())) {
    resultArray.push(item)
  }

  expect(resultArray).toEqual([[1, 'a', Number], [2, 'b', Boolean], [3, 'c', Object]])
})
