import { System, Entity } from "ecsy"
// import { Transform } from 'ecsy-three/src/extras/components'
import { TransformComponent } from '../components/TransformComponent'
import Behavior from "../../interfaces/Behavior"

import { Object3DComponent } from 'ecsy-three'
import * as THREE from 'three'


export const updateObject3D: Behavior = (entity: Entity, args: null, delta: number): void => {
  const transform: TransformComponent = entity.getComponent(TransformComponent)
  const obj3dcomp: Object3DComponent = entity.getMutableComponent(Object3DComponent)

  if (obj3dcomp === null) {
    console.error("entity has no Object3DComponent")
    return
  }
  let pos = (transform as any).position
  let rot = (transform as any).rotation
  let rotQuat = new THREE.Quaternion(rot[0], rot[1], rot[2], rot[3])
  let rotEuler = new THREE.Euler()
  rotEuler.setFromQuaternion(rotQuat);
  (obj3dcomp as any).value.position.set(pos[0], pos[1], pos[2]);
  (obj3dcomp as any).value.rotation.set(rotEuler.x, rotEuler.y, rotEuler.z)
}
