import { Entity } from "ecsy"
import Behavior from "../../common/interfaces/Behavior"
import TransformComponent from "../../transform/components/TransformComponent"

let follower, target
export const lookAtTarget: Behavior = (entityIn: Entity, args: any, delta: number, entityOut: Entity): void => {
  // TODO: Logic to have a camera follow a target
  follower = entityIn.getComponent<TransformComponent>(TransformComponent)
  target = entityOut.getComponent<TransformComponent>(TransformComponent)
}
