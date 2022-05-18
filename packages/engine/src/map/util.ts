import { Object3D, Vector3 } from 'three'

export function vectorToArray(vector: Vector3, target: [number, number] = new Array(2) as any): [number, number] {
  target[0] = vector.x
  target[1] = vector.z
  return target
}

// TODO(perf) add target param
export function multiplyArray<ArrayType extends number[]>(
  array: ArrayType,
  scalar: number,
  target: ArrayType = [] as any
): ArrayType {
  array.forEach((n, index) => {
    target[index] = n * scalar
  })
  return target
}

export function addChildFast(parent: Object3D, child: Object3D, children = parent.children) {
  child.parent = parent
  children.push(child)
}

export function setPosition(object3d: Object3D, centerPoint: [number, number]) {
  object3d.position.set(centerPoint[0], 0, centerPoint[1])
}
