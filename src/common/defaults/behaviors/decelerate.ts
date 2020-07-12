import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import { Actor } from "../components/Actor"
import { Transform } from "../components/Transform"
import { Scalar, Vector2, Vector3 } from "../../types/NumericalTypes"
import { vec3 } from "gl-matrix"

let actor: Actor
let transform: Transform
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const decelerate: Behavior = (entityIn: Entity, args: { state: Scalar | Vector2 | Vector3 }, delta: number): void => {
  // get actor comonent
  actor = entityIn.getComponent(Actor)
  // get the transform
  transform = entityIn.getComponent(Transform)

  // if magnitude of velocity is more than .001
  if (vec3.length(transform.velocity as vec3) > 0.001) {
    // add to velocity by adding state value * acceleration * delta
    transform.velocity[0] -= Math.max(actor.accelerationSpeed * delta, 0)
    transform.velocity[1] -= Math.max(actor.accelerationSpeed * delta, 0)
    transform.velocity[2] -= Math.max(actor.accelerationSpeed * delta, 0)
  }

  // clamp velocity to max value
  console.log("Decelerated")
}
