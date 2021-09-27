import { Material, SkinnedMesh } from 'three'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { CameraMode } from '../../camera/types/CameraMode'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { AvatarComponent } from '../components/AvatarComponent'

const setVisible = (entity: Entity, visible: boolean): void => {
  const object3DComponent = getComponent(entity, Object3DComponent)
  object3DComponent.value.traverse((obj) => {
    const mat = (obj as SkinnedMesh).material
    if (mat) {
      if (visible) {
        ;(mat as Material).opacity = 1
        ;(mat as Material).transparent = false
      } else {
        ;(mat as Material).opacity = 0
        ;(mat as Material).transparent = true
      }
    }
  })
}

type SwitchCameraModeProps = {
  cameraMode: CameraMode // TODO
  pointerLock?: boolean
}

let changeTimeout: any = undefined
export const switchCameraMode = (
  entity: Entity,
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

  const cameraFollow = getComponent(entity, FollowCameraComponent)
  cameraFollow.mode = args.cameraMode

  switch (args.cameraMode) {
    case CameraMode.FirstPerson:
      {
        cameraFollow.phi = 0
        cameraFollow.locked = true
        setVisible(entity, false)
      }
      break

    case CameraMode.ShoulderCam:
      {
        setVisible(entity, true)
      }
      break
    default:
    case CameraMode.ThirdPerson:
      {
        setVisible(entity, true)
      }
      break

    case CameraMode.TopDown:
      {
        setVisible(entity, true)
      }
      break
    case CameraMode.Strategic:
      {
        setVisible(entity, true)
      }
      break
  }
}
