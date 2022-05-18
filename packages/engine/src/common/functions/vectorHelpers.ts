import { Vector3 } from 'three'

export function getPrependicularVector(dir: Vector3, out: Vector3) {
  const arr = dir.toArray()
  const maxI = arr.indexOf(Math.max(...arr))
  const minI = arr.indexOf(Math.min(...arr))
  const midI = arr.findIndex((v, i) => i != minI && i != maxI)

  let temp = arr[midI]
  arr[midI] = -arr[maxI]
  arr[maxI] = temp
  arr[minI] = 0

  out.fromArray(arr).normalize()
}

const tempVec1 = new Vector3()
const tempVec2 = new Vector3()

// Create cone of normalized vectors around the input vector
// Useful for camera ray tests
export function createConeOfVectors(inputVec: Vector3, outputs: Vector3[], angle: number) {
  if (outputs.length < 1) {
    return
  }

  const dirLen = inputVec.length()
  const rayDelta = (2 * Math.PI) / outputs.length
  const coneRadius = Math.tan(angle) * dirLen

  getPrependicularVector(inputVec, tempVec1)
  tempVec2.crossVectors(inputVec, tempVec1).normalize()

  for (let i = 0; i < outputs.length; i++) {
    const vec = outputs[i]

    vec
      .addScaledVector(tempVec1, Math.cos(rayDelta * i))
      .addScaledVector(tempVec2, Math.sin(rayDelta * i))
      .multiplyScalar(coneRadius)
      .add(inputVec)
      .normalize()
  }
}
