import { Vector3 } from 'three'

export function vector3ToArray2(vector: Vector3): [number, number] {
  return [vector.x, vector.z]
}

export function multiplyArray<ArrayType extends number[]>(array: ArrayType, scalar: number): ArrayType {
  return array.map((value) => value * scalar) as any
}
