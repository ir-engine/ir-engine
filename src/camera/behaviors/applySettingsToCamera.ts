import { Entity } from "ecsy"
import { Behavior } from "../../common/interfaces/Behavior"
import { Camera } from "../components/Camera"

export const applySettingsToCamera: Behavior = (entity: Entity): void => {
  const cameraComponent = entity.getComponent(Camera) as Camera
  cameraComponent.camera.fov = cameraComponent.fov
  cameraComponent.camera.aspect = cameraComponent.aspect
  cameraComponent.camera.near = cameraComponent.near
  cameraComponent.camera.far = cameraComponent.far
  cameraComponent.camera.layers = cameraComponent.layers
  cameraComponent.camera.handleResize = cameraComponent.handleResize
}
