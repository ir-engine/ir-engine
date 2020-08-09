import { Entity } from "ecsy"
import { Behavior } from "../../common/interfaces/Behavior"

export const childTransformBehavior: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  console.log("Transformation child here")
}
