import { System, Entity } from "ecsy"
import Behavior from "../../common/interfaces/Behavior"
import Transform from "../../transform/components/Transform"
import { Camera } from "../components/Camera"
import { followTarget } from "../../transform/behaviors/followTarget"

export class CameraSystem extends System {
  follow: Behavior = followTarget
  execute(time, delta): void {
    this.queries.entities.results?.forEach(entity => {
      //this.applySettingsToCamera(entity)

      this.cameraFollowTarget(entity, delta)
    })

    this.queries.entities.added.forEach(entity => {
      console.log("Camera added!")
      //this.applySettingsToCamera(entity)

      this.cameraFollowTarget(entity, delta)
    })
    this.queries.entities.changed.forEach(entity => {
      //this.applySettingsToCamera(entity)
    })
  }

  cameraFollowTarget(entity: Entity, delta: number): void {
    const cam = entity.getComponent(Camera) as Camera
      if (cam.followingObjectReference) {
        cam.cameraObjectReference.addComponent(Transform)
        console.log(cam.followingObjectReference)
        this.follow(cam.cameraObjectReference, { distance: 100 }, delta, cam.followingObjectReference)
        console.log("moved")
      } else {
        console.log("not moved")
      }
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
