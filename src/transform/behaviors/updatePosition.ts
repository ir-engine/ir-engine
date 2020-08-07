import { Entity } from "ecsy"
import Behavior from "../../common/interfaces/Behavior"
import Transform from "../components/Transform"
import { vec3 } from "gl-matrix"

const _deltaV: vec3 = [0, 0, 0]
const _position: vec3 = [0, 0, 0]
let transform: Transform

export const updatePosition: Behavior = (entity: Entity, args: null, time: any): void => {
  transform = entity.getMutableComponent(Transform)
  vec3.set(_position, transform.position[0], transform.position[1], transform.position[2])
  if (vec3.length(transform.velocity as vec3) > 0) {
    console.log("Transform velocity is", transform.velocity)
    vec3.scale(_deltaV, transform.velocity as vec3, time.delta)
    vec3.add(_position, _position, _deltaV)
    console.log("New position is ", _position)
    transform.position = _position
  }
}
