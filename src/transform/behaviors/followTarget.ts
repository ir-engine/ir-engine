import { Entity } from "ecsy"
import { Behavior } from "../../common/interfaces/Behavior"
import { TransformComponent } from "../components/TransformComponent"

let follower, target

export const followTarget: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  follower = entityIn.getMutableComponent<TransformComponent>(TransformComponent)
  target = entityOut.getComponent<TransformComponent>(TransformComponent)

  // follower.position = target.position
  follower.position = target.position
  follower.position[1] = 2
  follower.rotation = target.rotation
}
