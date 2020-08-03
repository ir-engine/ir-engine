import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import Actor from "../components/Actor"
import { TransformComponent } from "../components/TransformComponent"
import { vec3 } from "gl-matrix"

let actor: Actor
let transform: TransformComponent
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const decelerate: Behavior = (entity: Entity, delta: number): void => {
  // get actor comonent
  actor = entity.getComponent(Actor)
  // get the transform
  transform = entity.getMutableComponent(TransformComponent)

  //if magnitude of velocity is more than .001
  if (vec3.length(transform.velocity as vec3) > 0.001) {
    // add to velocity by adding state value * acceleration * delta
    transform.velocity[0] *= Math.max(1.0 - actor.accelerationSpeed * delta, 0)
    // transform.velocity[1] *= Math.max(1.0 - actor.accelerationSpeed * delta, 0)
    transform.velocity[2] *= Math.max(1.0 - actor.accelerationSpeed * delta, 0)
    console.log(transform.velocity[0] + " | " + transform.velocity[1] + " | " + transform.velocity[2])
  }
}
