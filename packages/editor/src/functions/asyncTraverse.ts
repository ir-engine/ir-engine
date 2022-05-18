import { Object3D } from 'three'

export default async function asyncTraverse(object: Object3D, callback: (node: Object3D) => void) {
  await callback(object)
  for (const child of object.children) {
    await asyncTraverse(child, callback)
  }
}
