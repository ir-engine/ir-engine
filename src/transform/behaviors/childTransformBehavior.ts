import { Behavior } from "../../common/interfaces/Behavior"
import { Entity } from "../../ecs/classes/Entity"

export const childTransformBehavior: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  console.log("Transformation child here")
}
