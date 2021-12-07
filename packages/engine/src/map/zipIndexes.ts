// TODO move to functions/
export default function* zipIndexes<Item>(iterable: Iterable<Item>): Iterable<[number, Item]> {
  let index = 0
  for (const item of iterable) {
    yield [index, item]
    index++
  }
}
