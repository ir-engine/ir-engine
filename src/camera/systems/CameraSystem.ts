import { Attributes, System } from "../../ecs/System"
import { followTarget } from "../../transform/behaviors/followTarget"
import { CameraComponent } from "../components/CameraComponent"

export class CameraSystem extends System {
  init(attributes?: Attributes): void {
    //
  }
  execute(delta: number): void {
    this.queries.entities.results?.forEach(entity => {
      const cam = entity.getComponent(CameraComponent) as CameraComponent
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
