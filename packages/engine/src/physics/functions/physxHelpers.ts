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
  const result: number[] = []
  let offset = 0
  for (let i = 0; i < count; i++) {
    result.push(heap[(address + offset) >> 2])
    offset += 4
  }
  return result
}

export const vectorToArray = (vector: PhysX.VectorBase<any>) => {
  // return Array(vector.size()).map((_, i) => {
  //   return vector.get(i)
  // })

  const arr: number[] = []
  for (let i = 0; i < vector.size(); i++) {
    arr.push(vector.get(i))
  }

  return arr
}
