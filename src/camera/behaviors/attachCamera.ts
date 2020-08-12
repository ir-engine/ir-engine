import { Behavior } from "../.."
import { Entity } from "../../ecs/Entity"
import { CameraComponent } from "../components/CameraComponent"

export const attachCamera: Behavior = (entity: Entity): void => {
  console.log("Attaching camera to entity")
  CameraComponent.instance.followTarget = entity
}
