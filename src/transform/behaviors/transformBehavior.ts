import Behavior from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"

export const transformBehavior: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  console.log("Transformation here")
}
