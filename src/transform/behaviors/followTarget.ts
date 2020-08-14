import { Behavior } from "../../common/interfaces/Behavior"
import { TransformComponent } from "../components/TransformComponent"
import { Entity, getMutableComponent, getComponent } from "../../ecs"

let follower, target

export const followTarget: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  follower = getMutableComponent<TransformComponent>(entityIn, TransformComponent)
  target = getComponent<TransformComponent>(entityOut, TransformComponent)

  // follower.position = target.position
  follower.position = target.position
  follower.position[1] = 2
  follower.rotation = target.rotation
}
