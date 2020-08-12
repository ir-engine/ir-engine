import { CameraComponent } from "../components/CameraComponent"
import { Behavior } from "../.."
import { Entity } from "ecsy"

export const attachCamera: Behavior = (entity: Entity): void => {
  console.log("Attaching camera to entity")
  CameraComponent.instance.followTarget = entity
}
