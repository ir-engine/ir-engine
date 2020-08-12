import { Behavior } from "../../common/interfaces/Behavior"
import { Entity } from "../../ecs/Entity"
import { TransformComponent } from "../components/TransformComponent"

let follower, target
export const lookAtTarget: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  // TODO: Logic to have a camera follow a target
  follower = entityIn.getComponent<TransformComponent>(TransformComponent)
  target = entityOut.getComponent<TransformComponent>(TransformComponent)
}
