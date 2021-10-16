import { Object3D, Vector3 } from 'three'

// TODO(perf) add target param
export function vector3ToArray2(vector: Vector3): [number, number] {
  return [vector.x, vector.z]
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
