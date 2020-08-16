import { Behavior } from "../../common/interfaces/Behavior"
import { Entity } from "../../ecs/classes/Entity"
import { getComponentOnEntity } from "../../ecs/functions/EntityFunctions"
import { CameraComponent } from "../components/CameraComponent"

export const applySettingsToCamera: Behavior = (entity: Entity): void => {
  const cameraComponent = getComponentOnEntity(entity, CameraComponent) as CameraComponent
  cameraComponent.camera.fov = cameraComponent.fov
  cameraComponent.camera.aspect = cameraComponent.aspect
  cameraComponent.camera.near = cameraComponent.near
  cameraComponent.camera.far = cameraComponent.far
  cameraComponent.camera.layers = cameraComponent.layers
  cameraComponent.camera.handleResize = cameraComponent.handleResize
}
