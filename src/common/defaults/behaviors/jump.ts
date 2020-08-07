import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import Actor from "../components/Actor"
import Transform from "../../../transform/components/Transform"
import { addState, removeState } from "../../../state/behaviors/StateBehaviors"
import { DefaultStateTypes } from "../../../state/defaults/DefaultStateTypes"

let actor: Actor
let transform: Transform

export const jump: Behavior = (entity: Entity): void => {
  console.log("Jump!")
  actor = entity.getMutableComponent<Actor>(Actor)
  addState(entity, { state: DefaultStateTypes.JUMPING })
  actor.jump.t = 0
}

export const jumping: Behavior = (entity: Entity, args, delta: any): void => {
  transform = entity.getComponent(Transform)
  actor = entity.getMutableComponent<Actor>(Actor)
  actor.jump.t += delta
  if (actor.jump.t < actor.jump.duration) {
    transform.velocity[1] = Math.sin((actor.jump.t / actor.jump.duration) * Math.PI) * actor.jump.force
    return
  } else {
    console.log("End jump")
    removeState(entity, { state: DefaultStateTypes.JUMPING })
  }
}
