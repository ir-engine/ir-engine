import { round } from 'lodash'
import { Vector3 } from 'three'

export function roundmap(arr: number[]) {
  return arr.map((n) => round(n, 2))
}

export function debugvec(v: Vector3) {
  return roundmap(v.toArray())
}
