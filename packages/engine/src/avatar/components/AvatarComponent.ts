import { Group, Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

export class AvatarComponent extends Component<AvatarComponent> {
  /**
   * @property {Group} modelContainer is a group that holds the model such that the animations & IK can move seperate from the transform & collider
   * It's center is at the center of the collider, except with y sitting at the bottom of the collider, flush with the ground
   */
  modelContainer: Group
  isGrounded: boolean
  avatarId: string
  thumbnailURL: string
  avatarURL: string
  avatarHeight = 1.8
  avatarHalfHeight = 1.8 / 2

  /**
   * The direction this client is looking.
   * As TransformComponent.rotation is locked to XZ plane,
   * this allows the actor to have pitch independent of the collider & model.
   *
   * On the local client viewVector is controlled by TransformComponent.rotation
   * On the server and other clients this controls TransformComponent.rotation
   */
  viewVector: Vector3

  static _schema = {
    avatarId: { type: Types.String, default: null },
    thumbnailURL: { type: Types.String, default: null },
    avatarURL: { type: Types.String, default: null }
  }
}
