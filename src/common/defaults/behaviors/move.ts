import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import { Actor } from "../components/Actor"
import { Transform } from "../components/Transform"
import { Scalar, Vector2, Vector3 } from "../../types/NumericalTypes"
import State from "../../../state/components/State"
import { Crouching } from "../components/Crouching"
import { Sprinting } from "../components/Sprinting"

let actor: Actor
let transform: Transform
let stateValue: Vector2
let movementModifer: number
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const move: Behavior = (entityIn: Entity, args: { state: Scalar | Vector2 | Vector3 }, delta: number): void => {
  // get actor comonent
  actor = entityIn.getComponent(Actor)
  // get the transform
  transform = entityIn.getComponent(Transform)
  movementModifer = entityIn.hasComponent(Crouching) ? 0.5 : entityIn.hasComponent(Sprinting) ? 1.5 : 1.0
  stateValue = entityIn
    .getComponent(State)
    .values.toArray()
    .filter(value => {
      value.type === args.state
    })[0].value
  // add to velocity by adding state value * acceleration * delta
  transform.velocity[0] += Math.min(stateValue[0] * actor.accelerationSpeed * delta * movementModifer, actor.maxSpeed)
  transform.velocity[2] += Math.min(stateValue[1] * actor.accelerationSpeed * delta * movementModifer, actor.maxSpeed)

  // clamp velocity to max value
  console.log("Moved")
}
