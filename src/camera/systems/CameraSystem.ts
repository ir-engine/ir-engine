import { Attributes, System } from "../../ecs/classes/System"
import { followTarget } from "../../transform/behaviors/followTarget"
import { CameraComponent } from "../components/CameraComponent"
import { registerComponent } from "../../ecs/functions/ComponentFunctions"
import { createEntity, addComponent, getMutableComponent, getComponent, World } from "../../ecs"
import { TransformComponent } from "../.."

export class CameraSystem extends System {
  init(): void {
    registerComponent(CameraComponent)
    const cameraEntity = createEntity()
    addComponent(cameraEntity, CameraComponent, { camera: World.camera, followTarget: null })
    addComponent(cameraEntity, TransformComponent)
    getMutableComponent(cameraEntity, CameraComponent)
  }
  execute(delta: number): void {
    this.queries.entities.results?.forEach(entity => {
      const cam = getComponent(entity, CameraComponent) as CameraComponent
      if (cam.followTarget !== null && cam.followTarget !== undefined) {
        followTarget(entity, { distance: 100 }, delta, cam.followTarget)
      }
    })

    this.queries.entities.changed.forEach(entity => {
      // applySettingsToCamera(entity)
    })
  }
}

CameraSystem.queries = {
  entities: {
    components: [CameraComponent],
    listen: {
      added: true,
      changed: true
    }
  }
}
