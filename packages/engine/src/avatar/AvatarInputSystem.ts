import { Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { World } from '../ecs/classes/World'
import { getComponent, removeComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { LocalTransformComponent } from '../transform/components/TransformComponent'
import { getControlMode, XRState } from '../xr/XRState'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarTeleportComponent } from './components/AvatarTeleportComponent'
import { rotateAvatar } from './functions/moveAvatar'
import { AvatarInputSettingsState } from './state/AvatarInputSettingsState'

export default async function AvatarInputSystem(world: World) {
  const xrState = getState(XRState)
  const avatarInputSettingsState = getState(AvatarInputSettingsState)

  const cameraDifference = new Vector3()
  let teleport = null as null | XRHandedness

  let isVRRotatingLeft = false
  let isVRRotatingRight = false

  const execute = () => {
    const { inputSources, localClientEntity } = world
    if (!localClientEntity) return

    const cameraAttached = getControlMode() === 'attached'
    const controller = getComponent(localClientEntity, AvatarControllerComponent)
    const teleportControlsActive =
      cameraAttached && avatarInputSettingsState.controlScheme.value === 'AvatarMovementScheme_Teleport'

    for (const inputSource of inputSources) {
      if (inputSource.gamepad?.mapping === 'xr-standard') {
        const axes = inputSource.gamepad!.axes
        let xDelta = 0
        let yDelta = 0
        /** @todo do we want to sum these inputs up? */
        if (axes.length <= 2) {
          xDelta += Math.abs(axes[0]) > 0.05 ? axes[0] : 0
          yDelta += Math.abs(axes[1]) > 0.05 ? axes[1] : 0
        }
        if (axes.length >= 4) {
          xDelta += Math.abs(axes[2]) > 0.05 ? axes[2] : 0
          yDelta += Math.abs(axes[3]) > 0.05 ? axes[3] : 0
        }
        const canRotate = Math.abs(xDelta) > 0.1 && Math.abs(yDelta) < 0.1

        if (canRotate) {
          if (
            (inputSource.handedness === 'left' && !isVRRotatingLeft) ||
            (inputSource.handedness === 'right' && !isVRRotatingRight)
          )
            rotateAvatar(localClientEntity, (Math.PI / 6) * (xDelta > 0 ? -1 : 1)) // 30 degrees
        }
        if (inputSource.handedness === 'left') isVRRotatingLeft = canRotate
        else isVRRotatingRight = canRotate

        if (yDelta < -0.75 && !teleport) {
          teleport = inputSource.handedness
        }
      }
    }

    /** When in attached camera mode, avatar movement should correspond to physical device movement */
    if (cameraAttached) {
      /**
       * @todo #7328 we need a function to explicitly calculate transforms relative to the
       *   origin entity (or any entity), without making assumptions about hierarchy.
       *
       * ex:   `getTransformRelativeTo(world.cameraEntity, world.originEntity)`
       */
      const cameraTransformRelativeToOrigin = getComponent(world.cameraEntity, LocalTransformComponent)
      cameraDifference.copy(cameraTransformRelativeToOrigin.position).sub(xrState.previousCameraPosition.value)
      controller.desiredMovement.copy(cameraDifference)
    }

    if (teleportControlsActive) {
      if (teleport) {
        setComponent(localClientEntity, AvatarTeleportComponent, { side: teleport })
      } else {
        removeComponent(localClientEntity, AvatarTeleportComponent)
      }
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
