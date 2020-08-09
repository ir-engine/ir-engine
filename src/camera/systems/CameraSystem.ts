import { System } from "ecsy"
import { Behavior } from "../../common/interfaces/Behavior"
import { followTarget } from "../../transform/behaviors/followTarget"
import { applySettingsToCamera } from "../behaviors/applySettingsToCamera"
import { Camera } from "../components/Camera"

export class CameraSystem extends System {
  follow: Behavior = followTarget
  execute(delta: number): void {
    this.queries.entities.results?.forEach(entity => {
      const cam = entity.getComponent(Camera) as Camera
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
    components: [Camera],
    listen: {
      added: true,
      changed: true
    }
  }
}
