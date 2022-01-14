export default function keysEqual(a, b) {
  let aKeyCount = 0
  let bKeyCount = 0

  const aKeys = Object.keys(a)
  for (const aKey of aKeys) {
    if (Object.prototype.hasOwnProperty.call(a, aKey)) aKeyCount++
    if (!Object.prototype.hasOwnProperty.call(b, aKey)) return false
  }

  const bKeys = Object.keys(a)
  for (const bKey of bKeys) {
    if (Object.prototype.hasOwnProperty.call(b, bKey)) bKeyCount++
  }

  return aKeyCount === bKeyCount
}
