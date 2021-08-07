import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import type { Controller } from 'three-physx'
import { PerspectiveCamera, Vector3 } from 'three'
import { VectorSpringSimulator } from '../../physics/classes/VectorSpringSimulator'

/**
 * @author Shaw
 */
export class AvatarControllerComponent extends Component<AvatarControllerComponent> {
  controller: Controller
  frustumCamera: PerspectiveCamera
  movementEnabled = true
  isJumping: boolean
  isWalking = false
  walkSpeed = 1.5
  runSpeed = 5
  moveSpeed = 5
  jumpHeight = 4
  localMovementDirection: Vector3 = new Vector3()

  velocitySimulator: VectorSpringSimulator

  static _schema = {
    controller: { type: Types.Ref },
    frustumCamera: { type: Types.Ref },
    velocitySimulator: { type: Types.Ref }
  }
}
