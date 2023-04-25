import { getMutableState, getState } from '@etherealengine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { AvatarLeftArmIKComponent } from '../avatar/components/AvatarIKComponents'
import { Engine } from '../ecs/classes/Engine'
import { addComponent, getComponent, removeComponent } from '../ecs/functions/ComponentFunctions'
import { XRState } from './XRState'

export const getTrackingSpaceOffset = (height: number) => {
  const avatarComponent = getComponent(Engine.instance.localClientEntity, AvatarComponent)
  return avatarComponent.avatarHeight / height
}

export const setTrackingSpace = () => {
  const xrState = getMutableState(XRState)
  const offset = getTrackingSpaceOffset(xrState.viewerPose.value!.transform.position.y)
  xrState.sceneScale.set(offset)
  xrState.avatarCameraMode.set('attached')
}
