import { getState } from '@etherealengine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { Engine } from '../ecs/classes/Engine'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { XRState } from './XRState'

export const getPlayerHeight = () => {
  const state = getState(XRState)
  const pose = state.viewerPose?.transform.position
  return pose!
}

export const getTrackingSpaceMultiplier = (height: number) => {
  const avatarComponent = getComponent(Engine.instance.localClientEntity, AvatarComponent)
  return avatarComponent.avatarHeight - height
}
