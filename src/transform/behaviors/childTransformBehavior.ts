import Behavior from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"

export const childTransformBehavior: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  console.log("Transformation child here")
}
