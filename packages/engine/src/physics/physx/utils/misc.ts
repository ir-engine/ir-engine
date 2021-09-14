export const clone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

export const putIntoPhysXHeap = (heap, array: ArrayLike<number>) => {
  const ptr = PhysX._malloc(4 * array.length)
  let offset = 0

  for (let i = 0; i < array.length; i++) {
    heap[(ptr + offset) >> 2] = array[i]
    offset += 4
  }

  return ptr
}

export const getFromPhysXHeap = (heap, address, count) => {
  const result = []
  let offset = 0
  for (let i = 0; i < count; i++) {
    result.push(heap[(address + offset) >> 2])
    offset += 4
  }
  return result
}
