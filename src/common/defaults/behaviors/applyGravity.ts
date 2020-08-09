import { Entity } from "ecsy"
import { TransformComponent } from "../../../transform/components/TransformComponent"
import { Behavior } from "../../interfaces/Behavior"
import { Actor } from "../components/Actor"

let actor: Actor
let transform: TransformComponent

const gravity = 9.81

export const applyGravity: Behavior = (entity: Entity, args, delta: number): void => {
  transform = entity.getComponent(TransformComponent)
  actor = entity.getMutableComponent<Actor>(Actor)
  if (transform.position[1] > 0) {
    transform.velocity[1] = transform.velocity[1] - (gravity * (delta * delta)) / 2
  } else if (transform.velocity[1] < 0.00001) {
    transform.velocity[1] = 0
    transform.position[1] = 0
  }
}
