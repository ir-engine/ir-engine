import { Group, Vector3 } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type AvatarComponentType = {
  /**
   * @property {Group} modelContainer is a group that holds the model such that the animations & IK can move seperate from the transform & collider
   * It's center is at the center of the collider, except with y sitting at the bottom of the collider, flush with the ground
   */
  modelContainer: Group
  isGrounded: boolean
  avatarId: string
  thumbnailURL: string
  avatarURL: string
  avatarHeight: number
  avatarHalfHeight: number

  /**
   * The direction this client is looking.
   * As TransformComponent.rotation is locked to XZ plane,
   * this allows the actor to have pitch independent of the collider & model.
   *
   * On the local client viewVector is controlled by TransformComponent.rotation
   * On the server and other clients this controls TransformComponent.rotation
   */
  viewVector: Vector3
}

export const AvatarComponent = createMappedComponent<AvatarComponentType>()
