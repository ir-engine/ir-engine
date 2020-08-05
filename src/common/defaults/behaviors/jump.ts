import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import Actor from "../components/Actor"
import { TransformComponent } from "../../../transform/components/TransformComponent"
import { addState, removeState } from "../../../state/behaviors/StateBehaviors"
import { DefaultStateTypes } from "../../../state/defaults/DefaultStateTypes"

let actor: Actor
let transform: TransformComponent

export const jump: Behavior = (entity: Entity): void => {
  console.log("Jump!")
  addState(entity, { state: DefaultStateTypes.JUMPING })
  actor = entity.getMutableComponent(Actor)
  actor.jump.t = 0
}

export const jumping: Behavior = (entity: Entity, args, delta: number): void => {
  transform = entity.getComponent(TransformComponent)
  actor = entity.getMutableComponent(Actor)
  actor.jump.t += delta
  if (actor.jump.t < actor.jump.duration) {
    transform.velocity[1] = transform.velocity[1] + Math.cos((actor.jump.t / actor.jump.duration) * Math.PI)
    console.log("Jumping: " + actor.jump.t)
    return
  }

  removeState(entity, { state: DefaultStateTypes.JUMPING })
  console.log("Jumped")
}
