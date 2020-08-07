import { System, Entity } from "ecsy"
import Camera from "../components/Camera"

class CameraSystem extends System {
  execute(): void {
    this.queries.entities.added.forEach(entity => {
      this.applySettingsToCamera(entity)
    })
    this.queries.entities.changed.forEach(entity => {
      this.applySettingsToCamera(entity)
    })
  }

  applySettingsToCamera(entity: Entity): void {
    const cameraComponent = entity.getComponent(Camera) as Camera
    cameraComponent.cameraObjectReference.fov = cameraComponent.fov
    cameraComponent.cameraObjectReference.aspect = cameraComponent.aspect
    cameraComponent.cameraObjectReference.near = cameraComponent.near
    cameraComponent.cameraObjectReference.far = cameraComponent.far
    cameraComponent.cameraObjectReference.layers = cameraComponent.layers
    cameraComponent.cameraObjectReference.handleResize = cameraComponent.handleResize
  }
}

CameraSystem.queries = {
  entities: {
    components: [Camera],
    listen: {
      added: true,
      changed: true
    }
  }
}

export default CameraSystem
