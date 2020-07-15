import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import Jumping from "../components/Jumping"
import { TransformComponent } from "../components/TransformComponent"
import { removeComponentsFromStateGroup } from "../../../state/behaviors/StateGroupBehaviors"
import StateGroupType from "../../../state/types/StateGroupType"

let jumping: Jumping
let transform: TransformComponent
export const jump: Behavior = (entityIn: Entity, args: { stateGroup: StateGroupType }, delta: number): void => {
  jumping = entityIn.getComponent(Jumping)
  transform = entityIn.getComponent(TransformComponent)
  jumping.t += delta
  if (jumping.t < jumping.duration) {
    transform.velocity[1] = transform.velocity[1] + Math.cos((jumping.t / jumping.duration) * Math.PI)
  }
  removeComponentsFromStateGroup(entity, args.stateGroup, Jumping as any)
  // if t < duration, remove this component
  console.log("Jumped")
}
