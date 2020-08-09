import { Entity } from "ecsy"
import { Object3DComponent } from "ecsy-three"
import { vec3 } from "gl-matrix"
import { Behavior } from "../../common/interfaces/Behavior"
import { TransformComponent as Transform } from "../components/TransformComponent"

let follower, target
const _deltaV: vec3 = [0, 0, 0]
const _position: vec3 = [0, 0, 0]
const _velocity: vec3 = [0, 0, 0]

export const followTarget: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  follower = entityIn.getMutableComponent<Transform>(Transform)
  target = entityOut.getComponent<Transform>(Transform)

  vec3.set(_position, target.position[0] - args.distance, target.position[1] + 50, target.position[2] - args.distance)

  if (vec3.length(_velocity) > 0) {
    vec3.scale(_deltaV, _velocity, delta)
    vec3.add(_position, _position, _deltaV)
    follower.position = _position
    follower.velocity = _velocity
  }

  const camera3DComponent = entityIn.getComponent(Object3DComponent)
  camera3DComponent.value.position.set(_position[0], _position[1], _position[2])
}
