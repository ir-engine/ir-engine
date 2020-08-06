import { Entity } from "ecsy"
import Behavior from "../../common/interfaces/Behavior"
import Transform from "../components/Transform"

let follower, target
export const followTarget: Behavior = (entityIn: Entity, args: any, delta: number, entityOut: Entity): void => {
  // TODO: Logic to have a camera follow a target
  follower = entityIn.getComponent<Transform>(Transform)
  target = entityOut.getComponent<Transform>(Transform)
}
