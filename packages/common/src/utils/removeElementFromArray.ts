export function removeElementFromArray<T = any>(arr: T[], element: T): boolean {
  const index = arr.indexOf(element)
  if (index != -1) {
    arr.splice(index, 1)
    return true
  } else {
    return false
  }
}
