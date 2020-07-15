import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import Jumping from "../components/Jumping"
import { TransformComponent } from "../components/TransformComponent"
import StateGroupType from "../../../state/types/StateGroupType"

let jumping: Jumping
let transform: TransformComponent
export const jump: Behavior = (entity: Entity, args: { stateGroup: StateGroupType }, delta: number): void => {
  console.log("Jump!")
  jumping = entity.getComponent(Jumping)
  jumping.duration = 1.0
  transform = entity.getComponent(TransformComponent)
  jumping.t += delta
  if (jumping.t < jumping.duration) {
    transform.velocity[1] = transform.velocity[1] + Math.cos((jumping.t / jumping.duration) * Math.PI)
    console.log(jumping.t)
    return
  }

  // needs to remove self from stack!

  //  removeComponentsFromStateGroup(entity, args.stateGroup, Jumping as any)
  // if t < duration, remove this component
  console.log("Jumped")
}
