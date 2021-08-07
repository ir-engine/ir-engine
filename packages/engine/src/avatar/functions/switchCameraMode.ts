import { Material, SkinnedMesh } from 'three'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { CameraModes } from '../../camera/types/CameraModes'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
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
  cameraMode: string // TODO
  pointerLock?: boolean
}

let changeTimeout = undefined
export const switchCameraMode = (
  entity: Entity,
  args: SwitchCameraModeProps = { pointerLock: false, cameraMode: CameraModes.ThirdPerson },
  force = false
): void => {
  if (!force) {
    if (changeTimeout !== undefined) return
    changeTimeout = setTimeout(() => {
      clearTimeout(changeTimeout)
      changeTimeout = undefined
    }, 250)
  }

  const cameraFollow = getMutableComponent(entity, FollowCameraComponent)
  cameraFollow.mode = args.cameraMode

  switch (args.cameraMode) {
    case CameraModes.FirstPerson:
      {
        cameraFollow.phi = 0
        cameraFollow.locked = true
        setVisible(entity, false)
      }
      break

    case CameraModes.ShoulderCam:
      {
        setVisible(entity, true)
      }
      break
    default:
    case CameraModes.ThirdPerson:
      {
        setVisible(entity, true)
      }
      break

    case CameraModes.TopDown:
      {
        setVisible(entity, true)
      }
      break
    case CameraModes.Strategic:
      {
        setVisible(entity, true)
      }
      break
  }
}
