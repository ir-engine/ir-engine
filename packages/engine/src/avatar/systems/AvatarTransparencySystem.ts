import {
  ECSState,
  Engine,
  PresentationSystemGroup,
  defineSystem,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent
} from '@etherealengine/ecs'
import { getState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import { XRControlsState } from '@etherealengine/spatial/src/xr/XRState'
import { Vector3 } from 'three'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarIKComponents'
import { TransparencyDitheringComponent } from '../components/TransparencyDitheringComponent'

const eyeOffset = 0.25
const execute = () => {
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  const deltaSeconds = getState(ECSState).deltaSeconds
  const cameraDithering = getOptionalMutableComponent(selfAvatarEntity, TransparencyDitheringComponent[0])
  if (!cameraDithering) return

  const cameraAttached = getState(XRControlsState).isCameraAttachedToAvatar

  const avatarComponent = getComponent(selfAvatarEntity, AvatarComponent)
  const headDithering = getMutableComponent(selfAvatarEntity, TransparencyDitheringComponent[1])
  headDithering.center.set(new Vector3(0, avatarComponent.eyeHeight, 0))
  const cameraComponent = getOptionalComponent(Engine.instance.cameraEntity, FollowCameraComponent)
  headDithering.distance.set(
    cameraComponent && !cameraAttached ? Math.max(Math.pow(cameraComponent.distance * 5, 2.5), 3) : 3.25
  )
  headDithering.exponent.set(cameraAttached ? 12 : 8)
  getMutableComponent(selfAvatarEntity, TransparencyDitheringComponent[0]).center.set(
    getComponent(Engine.instance.viewerEntity, TransformComponent).position
  )
  cameraDithering.distance.set(cameraAttached ? 6 : 3)
  cameraDithering.exponent.set(cameraAttached ? 10 : 2)

  if (!cameraComponent) return
  const hasDecapComponent = hasComponent(selfAvatarEntity, AvatarHeadDecapComponent)
  if (hasDecapComponent) cameraComponent.offset.setZ(Math.min(cameraComponent.offset.z + deltaSeconds, eyeOffset))
  else cameraComponent.offset.setZ(Math.max(cameraComponent.offset.z - deltaSeconds, 0))
}

export const AvatarTransparencySystem = defineSystem({
  uuid: 'AvatarTransparencySystem',
  execute,
  insert: { with: PresentationSystemGroup }
})
