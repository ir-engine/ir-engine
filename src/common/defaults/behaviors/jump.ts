import { getComponent, getMutableComponent } from "../../../ecs"
import { Entity } from "../../../ecs/classes/Entity"
import { addState, removeState } from "../../../state/behaviors/StateBehaviors"
import { DefaultStateTypes } from "../../../state/defaults/DefaultStateTypes"
import { TransformComponent } from "../../../transform/components/TransformComponent"
import { Behavior } from "../../interfaces/Behavior"
import { Actor } from "../components/Actor"

let actor: Actor
let transform: TransformComponent

export const jump: Behavior = (entity: Entity): void => {
  actor = getMutableComponent<Actor>(entity, Actor)
  addState(entity, { state: DefaultStateTypes.JUMPING })
  actor.jump.t = 0
}

export const jumping: Behavior = (entity: Entity, args, delta: any): void => {
  transform = getComponent(entity, TransformComponent)
  actor = getMutableComponent<Actor>(entity, Actor)
  actor.jump.t += delta
  if (actor.jump.t < actor.jump.duration) {
    transform.velocity[1] = Math.sin((actor.jump.t / actor.jump.duration) * Math.PI) * actor.jump.force
    return
  } else {
    removeState(entity, { state: DefaultStateTypes.JUMPING })
  }
}
