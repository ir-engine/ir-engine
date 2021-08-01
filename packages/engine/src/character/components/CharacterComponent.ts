import { Group, PerspectiveCamera, Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { RelativeSpringSimulator } from '../../physics/classes/SpringSimulator'
import { VectorSpringSimulator } from '../../physics/classes/VectorSpringSimulator'

export class CharacterComponent extends Component<CharacterComponent> {
  dispose(): void {
    super.dispose()
    this.modelContainer.removeFromParent()
  }

  // === CORE == //

  /**
   * @property {Group} modelContainer is a group that holds the model such that the animations & IK can move seperate from the transform & collider
   * It's center is at the center of the collider, except with y sitting at the bottom of the collider, flush with the ground
   */
  modelContainer: Group
  frustumCamera: PerspectiveCamera = new PerspectiveCamera(60, 2, 0.1, 3)
  visible = true // used for turning model invisble when first person

  // === AVATAR === //

  avatarId: string
  thumbnailURL: string
  avatarURL: string
  actorHeight = 1.8
  actorHalfHeight = 1.8 / 2

  // === MOVEMENT === //
  // TODO: move to character controller

  movementEnabled = true
  isGrounded: boolean
  isJumping: boolean
  isWalking = false
  walkSpeed = 1.5
  runSpeed = 5
  moveSpeed = 5
  jumpHeight = 4
  localMovementDirection = new Vector3()
  velocity: Vector3 // velocity in local space

  defaultVelocitySimulatorDamping = 0.8
  defaultVelocitySimulatorMass = 50
  velocitySimulator: VectorSpringSimulator
  moveVectorSmooth: VectorSpringSimulator
  defaultRotationSimulatorDamping = 0.5
  defaultRotationSimulatorMass = 10
  rotationSimulator: RelativeSpringSimulator

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
    avatarURL: { type: Types.String, default: null },
    velocity: { type: Types.Vector3Type, default: new Vector3() }
  }
}
