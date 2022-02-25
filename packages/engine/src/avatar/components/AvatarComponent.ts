import { Group } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AvatarComponentType = {
  /**
   * @property {Group} modelContainer is a group that holds the model such that the animations & IK can move seperate from the transform & collider
   * It's center is at the center of the collider, except with y sitting at the bottom of the collider, flush with the ground
   */
  modelContainer: Group
  isGrounded: boolean
  avatarHeight: number
  avatarHalfHeight: number
}

export const AvatarComponent = createMappedComponent<AvatarComponentType>('AvatarComponent')
