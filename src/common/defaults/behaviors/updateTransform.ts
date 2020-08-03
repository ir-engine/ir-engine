import { System, Entity } from "ecsy"
import { Transform } from 'ecsy-three/src/extras/components'
import { TransformComponent } from '../components/TransformComponent'
import Behavior from "../../interfaces/Behavior"

import * as THREE from 'three'


export const updateTransform: Behavior = (entity: Entity, args: null, delta: number): void => {
  const armadaTransform: TransformComponent = entity.getComponent(TransformComponent)
  const transform: Transform = entity.getMutableComponent(Transform)

  let pos = (armadaTransform as any).position
  let rot = (armadaTransform as any).rotation
  let rotQuat = new THREE.Quaternion(rot[0], rot[1], rot[2], rot[3])
  let rotEuler = new THREE.Euler()
  rotEuler.setFromQuaternion(rotQuat)
  transform.position.set(pos[0], pos[1], pos[2])
  transform.rotation.set(rotEuler.x, rotEuler.y, rotEuler.z)
}
