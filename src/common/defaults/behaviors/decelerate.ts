import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import Actor from "../components/Actor"
import Transform from "../../../transform/components/Transform"
import { vec3 } from "gl-matrix"

let actor: Actor
let transform: Transform
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const decelerate: Behavior = (entity: Entity, args: null, delta: number): void => {
  actor = entity.getComponent<Actor>(Actor)
  transform = entity.getMutableComponent(Transform)

  if (vec3.length(transform.velocity as vec3) > 0.001) {
    transform.velocity[0] = transform.velocity[0] * Math.max(1.0 - actor.accelerationSpeed * delta, 0)
    transform.velocity[1] = transform.velocity[1] * Math.max(1.0 - actor.accelerationSpeed * delta, 0)
    transform.velocity[2] = transform.velocity[2] * Math.max(1.0 - actor.accelerationSpeed * delta, 0)
  }
}
