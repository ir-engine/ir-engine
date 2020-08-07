import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import Actor from "../components/Actor"
import Transform from "../../../transform/components/Transform"
import { addState, removeState } from "../../../state/behaviors/StateBehaviors"
import { DefaultStateTypes } from "../../../state/defaults/DefaultStateTypes"

let actor: Actor
let transform: Transform

const gravity = 9.81

export const applyGravity: Behavior = (entity: Entity, args, delta: number): void => {
  transform = entity.getComponent(Transform)
  actor = entity.getMutableComponent<Actor>(Actor)
  if (transform.position[1] > 0) {
    transform.velocity[1] = transform.velocity[1] - (gravity * (delta * delta)) / 2
  } else if (transform.velocity[1] < 0.00001) {
    transform.velocity[1] = 0
    transform.position[1] = 0
  }
}
