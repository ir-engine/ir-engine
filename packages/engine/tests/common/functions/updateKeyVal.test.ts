import updateKeyVal from "../../../src/common/functions/updateKeyVal"

test("updateKeyVal", () => {
  const map = new Map<string, number>()

  const add = updateKeyVal(map.get.bind(map), map.set.bind(map), (value: number, addend: number) => {
    return value + addend
  }, 0)

  add('beer', 2)
  add('beer', 3)
  add('hotdog', 7)
  add('hotdog', -2)

  expect(map.get('beer')).toBe(5)
  expect(map.get('hotdog')).toBe(5)
})
