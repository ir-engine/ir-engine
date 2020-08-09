import { Entity } from "ecsy"
import { vec3 } from "gl-matrix"
import { Behavior } from "../../common/interfaces/Behavior"
import { TransformComponent } from "../components/TransformComponent"

const _deltaV: vec3 = [0, 0, 0]
const _position: vec3 = [0, 0, 0]
let transform: TransformComponent

export const updatePosition: Behavior = (entity: Entity, args: null, time: any): void => {
  transform = entity.getMutableComponent(TransformComponent)
  vec3.set(_position, transform.position[0], transform.position[1], transform.position[2])
  if (vec3.length(transform.velocity as vec3) > 0) {
    vec3.scale(_deltaV, transform.velocity as vec3, time.delta)
    vec3.add(_position, _position, _deltaV)
    transform.position = _position
  }
}
