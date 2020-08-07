import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import Actor from "../components/Actor"
import Transform from "../../../transform/components/Transform"
import { vec3 } from "gl-matrix"

let actor: Actor
let transform: Transform
const velocity: vec3 = [0, 0, 0]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const decelerate: Behavior = (entity: Entity, args: null, delta: number): void => {
  actor = entity.getComponent<Actor>(Actor)
  transform = entity.getMutableComponent(Transform)
  vec3.set(velocity, transform.velocity[0], transform.velocity[1], transform.velocity[2])
  if (vec3.length(velocity) > 0) {
    vec3.scale(velocity, velocity, 1.0 - actor.decelerationSpeed * delta)
    // Set X and Z so gravity works OK
    transform.velocity[0] = velocity[0]
    transform.velocity[2] = velocity[2]
  }
}
