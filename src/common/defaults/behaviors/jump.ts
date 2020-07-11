import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import Jumping from "../components/Jumping"
import { Transform } from "../components/Transform"
import { removeComponentsFromStateGroup } from "../../../state/behaviors/StateGroupBehaviors"
import StateGroupType from "../../../state/types/StateGroupType"

let jumping: Jumping
let transform: Transform
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const jump: Behavior = (entityIn: Entity, args: { stateGroup: StateGroupType }, delta: number): void => {
  // Get jumping component
  jumping = entityIn.getComponent(Jumping)
  transform = entityIn.getComponent(Transform)
  jumping.t += delta
  // if t < duration, advance t
  if (jumping.t < jumping.duration) {
    // velocity = cos ((t / duration) * pi)
    transform.velocity[1] = transform.velocity[1] + Math.cos((jumping.t / jumping.duration) * Math.PI)
    // state group check
  }
  removeComponentsFromStateGroup(entityIn, args.stateGroup, Jumping as any)
  // if t < duration, remove this component
  console.log("Jumped")
}
