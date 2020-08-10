import { System } from "ecsy"
import { followTarget } from "../../transform/behaviors/followTarget"
import { applySettingsToCamera } from "../behaviors/applySettingsToCamera"
import { CameraComponent } from "../components/CameraComponent"

export class CameraSystem extends System {
  execute(delta: number): void {
    this.queries.entities.results?.forEach(entity => {
      const cam = entity.getComponent(CameraComponent) as CameraComponent
      if (cam.followTarget !== null && cam.followTarget !== undefined) {
        followTarget(cam.camera, { distance: 100 }, delta, cam.followTarget)
      }
    })

    this.queries.entities.changed.forEach(entity => {
      applySettingsToCamera(entity)
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
