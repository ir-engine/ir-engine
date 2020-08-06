import { Entity } from "ecsy"
import Transform from "../../../transform/components/Transform"
import Behavior from "../../interfaces/Behavior"

import * as THREE from "three"
let i = 0
const eulerMap = {
  0: "x",
  1: "y",
  2: "z"
}
export const updateTransform: Behavior = (entity: Entity, args: null, delta: number): void => {
  const armadaTransform: Transform = entity.getComponent(Transform)
  const transform: Transform = entity.getMutableComponent(Transform)

  const pos = (armadaTransform as any).position
  const rot = (armadaTransform as any).rotation
  const rotQuat = new THREE.Quaternion(rot[0], rot[1], rot[2], rot[3])
  const rotEuler = new THREE.Euler()
  rotEuler.setFromQuaternion(rotQuat)
  for (i = 0; i < 3; i++) {
    transform.position[i] = pos[i]
    transform.rotation[i] = rotEuler[eulerMap[i]]
  }
}
