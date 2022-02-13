export default function keysEqual(a, b) {
  let aKeyCount = 0
  let bKeyCount = 0

  const aKeys = Object.keys(a)
  for (const aKey of aKeys) {
    if (typeof a[aKey] !== 'undefined') aKeyCount++
    if (typeof b[aKey] === 'undefined') return false
  }

  const bKeys = Object.keys(a)
  for (const bKey of bKeys) {
    if (typeof b[bKey] !== 'undefined') bKeyCount++
  }

  return aKeyCount === bKeyCount
}
