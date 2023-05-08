import { getMutableState } from '@etherealengine/hyperflux'

import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { Engine } from '../ecs/classes/Engine'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { XRState } from './XRState'

export const getTrackingSpaceOffset = (height: number) => {
  const avatarComponent = getComponent(Engine.instance.localClientEntity, AvatarComponent)
  return height / avatarComponent.avatarHeight
}

export const setTrackingSpace = () => {
  const xrState = getMutableState(XRState)
  const offset = getTrackingSpaceOffset(xrState.viewerPose.value!.transform.position.y)
  xrState.sceneScale.set(offset)
  xrState.avatarCameraMode.set('attached')
}
