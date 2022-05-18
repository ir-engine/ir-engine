export default function isEmptyObject(object) {
  for (const key in object) {
    if (typeof object[key] !== 'undefined') {
      return false
    }
  }
  return true
}
