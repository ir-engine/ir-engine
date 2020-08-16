import { TransformComponent } from "../../../transform/components/TransformComponent"
import { Behavior } from "../../interfaces/Behavior"
import { Actor } from "../components/Actor"
import { Entity } from "../../../ecs/classes/Entity"
import { getComponentOnEntity, getMutableComponent } from "../../../ecs/functions/EntityFunctions"

let actor: Actor
let transform: TransformComponent

const gravity = 9.81

export const applyGravity: Behavior = (entity: Entity, args, delta: number): void => {
  transform = getComponentOnEntity(entity, TransformComponent)
  actor = getMutableComponent<Actor>(entity, Actor)
  if (transform.position[1] > 0) {
    transform.velocity[1] = transform.velocity[1] - (gravity * (delta * delta)) / 2
  } else if (transform.velocity[1] < 0.00001) {
    transform.velocity[1] = 0
    transform.position[1] = 0
  }
}
