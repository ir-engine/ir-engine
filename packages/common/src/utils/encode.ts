import { Vector3, Quaternion } from 'three'
import { encodeFloat } from './bitConverter'
import { combine } from './miscUtils'

export function encodeVector3(pos: Vector3) {
  const bx = encodeFloat(pos.x)
  const by = encodeFloat(pos.y)
  const bz = encodeFloat(pos.z)

  return combine(bx, by, bz)
}

export function encodeQuaternion(q: Quaternion) {
  const qArray = [q.x, q.y, q.z, q.w]
  let largestValue = 0
  let largestIndex = 0
  let largestSign = true

  for (let i = 0; i < qArray.length; i++) {
    const value = qArray[i]

    if (Math.abs(value) > Math.abs(largestValue)) {
      largestValue = value
      largestIndex = i
      largestSign = value > 0
    }
  }

  const quantizedComponents: any[] = []
  let siftedIndex = 0

  for (let i = 0; i < 4; i++) {
    let value = qArray[i]

    if (i !== largestIndex) {
      if (!largestSign) {
        value = -value
      }

      quantizedComponents[siftedIndex] = value
      siftedIndex++
    }
  }

  /*quantizedComponents[0] = encodeFloat(quantizedComponents[0])
    quantizedComponents[1] = encodeFloat(quantizedComponents[1])
    quantizedComponents[2] = encodeFloat(quantizedComponents[2])*/

  return [largestIndex, quantizedComponents[0], quantizedComponents[1], quantizedComponents[2]]
}
