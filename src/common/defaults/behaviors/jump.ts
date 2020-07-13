import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import Jumping from "../components/Jumping"
import { Transform } from "../components/Transform"
import { removeComponentsFromStateGroup } from "../../../state/behaviors/StateGroupBehaviors"
import StateGroupType from "../../../state/types/StateGroupType"

let jumping: Jumping
let transform: Transform
export const jump: Behavior = (entityIn: Entity, args: { stateGroup: StateGroupType }, delta: number): void => {
  jumping = entityIn.getComponent(Jumping)
  transform = entityIn.getComponent(Transform)
  jumping.t += delta
  if (jumping.t < jumping.duration) {
    transform.velocity[1] = transform.velocity[1] + Math.cos((jumping.t / jumping.duration) * Math.PI)
  }
  removeComponentsFromStateGroup(entityIn, args.stateGroup, Jumping as any)
  // if t < duration, remove this component
  console.log("Jumped")
}
