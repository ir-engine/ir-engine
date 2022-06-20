import { Mesh, Object3D } from 'three'

import iterateObject3D from './iterateObject3D'

export default function getFirstMesh(obj3d: Object3D) {
  return iterateObject3D(
    obj3d,
    (child) => child,
    (child: Mesh) => child.isMesh,
    false,
    true
  )[0]
}
