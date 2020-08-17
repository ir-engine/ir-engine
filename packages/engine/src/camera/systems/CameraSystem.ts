import { TransformComponent } from "../../transform/components/TransformComponent"

import { System } from "../../ecs/classes/System"
import { registerComponent } from "../../ecs/functions/ComponentFunctions"
import { followTarget } from "../../transform/behaviors/followTarget"
import { CameraComponent } from "../components/CameraComponent"
import { createEntity, getMutableComponent, getComponent, addComponent } from "../../ecs/functions/EntityFunctions"
import { Engine } from "../../ecs/classes/Engine"

export class CameraSystem extends System {
  init(): void {
    registerComponent(CameraComponent)
    const cameraEntity = createEntity()
    addComponent(cameraEntity, CameraComponent, { camera: Engine.camera, followTarget: null })
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
