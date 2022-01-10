import { Quaternion, Vector3 } from 'three'
import { decodeFloat } from './bitConverter'

export function decodeVector3(array): Vector3 {
  const xArray: any[] = []
  const yArray: any[] = []
  const zArray: any[] = []

  for (let i = 0; i < array.length; i++) {
    if (i < 4) xArray.push(array[i])
    else if (i >= 4 && i < 8) yArray.push(array[i])
    else zArray.push(array[i])
  }

  const x = decodeFloat(xArray)
  const y = decodeFloat(yArray)
  const z = decodeFloat(zArray)

  return new Vector3(x, y, z)
}

export function decodeQuaternion(array): Quaternion {
  if (array.length === 4) {
    const largestIndex = array[0]
    if (array[1] === null) array[1] = 0
    if (array[2] === null) array[2] = 0
    if (array[3] === null) array[3] = 0
    const unquantizedComponents = [array[1], array[2], array[3]] // !quatIsZero ? [ decodeFloat(array[1]), decodeFloat(array[2]), decodeFloat(array[3]) ] : [ array[1], array[2], array[3] ]
    const a = unquantizedComponents[0]
    const b = unquantizedComponents[1]
    const c = unquantizedComponents[2]

    const res: number[] = []
    let siftedIndex = 0
    for (let i = 0; i < 4; i++) {
      if (i === largestIndex) {
        const v = a * a + b * b + c * c
        res[i] = Math.sqrt(1 - v)
      } else {
        res[i] = unquantizedComponents[siftedIndex]
        siftedIndex++
      }
    }

    return new Quaternion(res[0], res[1], res[2], res[3])
  }
  return new Quaternion()
}

function quatIsZero(array) {
  if (array[1] === 0 && array[2] === 0 && array[3] === 0) return true
  if (
    array[0].constructor.name != 'Array' &&
    array[1].constructor.name != 'Array' &&
    array[2].constructor.name != 'Array'
  )
    return true
  return false
}
