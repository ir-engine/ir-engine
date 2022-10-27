import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { CameraMode } from '../../camera/types/CameraMode'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'

type SwitchCameraModeProps = {
  cameraMode: CameraMode // TODO
  pointerLock?: boolean
}

let changeTimeout: any = undefined
export const switchCameraMode = (
  cameraEntity: Entity,
  args: SwitchCameraModeProps = { pointerLock: false, cameraMode: CameraMode.ThirdPerson },
  force = false
): void => {
  if (!force) {
    if (changeTimeout !== undefined) return
    changeTimeout = setTimeout(() => {
      clearTimeout(changeTimeout)
      changeTimeout = undefined
    }, 250)
  }

  const cameraFollow = getComponent(cameraEntity, FollowCameraComponent)
  if (!cameraFollow) return
  cameraFollow.mode = args.cameraMode

  if (cameraFollow.mode === CameraMode.FirstPerson) {
    cameraFollow.phi = 0
    cameraFollow.locked = true
  }
}
