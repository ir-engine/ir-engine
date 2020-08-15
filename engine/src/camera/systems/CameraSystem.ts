import { TransformComponent } from "../../transform/components/TransformComponent"

import { System } from "../../ecs/classes/System"
import { registerComponent } from "../../ecs/functions/ComponentFunctions"
import { followTarget } from "../../transform/behaviors/followTarget"
import { CameraComponent } from "../components/CameraComponent"
import { createEntity, addComponent, getMutableComponent, getComponent } from "../../ecs/functions/EntityFunctions"
import { World } from "../../ecs/classes/World"

export class CameraSystem extends System {
  init(): void {
    registerComponent(CameraComponent)
    const cameraEntity = createEntity()
    addComponent(cameraEntity, CameraComponent, { camera: World.camera, followTarget: null })
    addComponent(cameraEntity, TransformComponent)
    getMutableComponent(cameraEntity, CameraComponent)
  }
  execute(delta: number): void {
    this.queryResults.entities.all?.forEach(entity => {
      const cam = getComponent(entity, CameraComponent) as CameraComponent
      if (cam.followTarget !== null && cam.followTarget !== undefined) {
        followTarget(entity, { distance: 100 }, delta, cam.followTarget)
      }
    })

    this.queryResults.entities.changed.forEach(entity => {
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
