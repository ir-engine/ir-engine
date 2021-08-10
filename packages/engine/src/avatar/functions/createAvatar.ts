import { DEFAULT_AVATAR_ID } from '@xrengine/common/src/constants/AvatarConstants'
import { AnimationMixer, Group, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { VectorSpringSimulator } from '../../physics/classes/VectorSpringSimulator'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarInputSchema } from '../AvatarInputSchema'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { Body, BodyType, Controller, PhysXInstance, RaycastQuery, SceneQueryType, SHAPES } from 'three-physx'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { AnimationGraph } from '../animations/AnimationGraph'
import { AnimationState } from '../animations/AnimationState'

const avatarRadius = 0.25
const capsuleHeight = 1.3
const avatarHeight = 1.8
const avatarHalfHeight = 0.9

/**
 *
 * @param {Entity} entity
 * @param {string} uniqueId
 * @param {networkId} networkId
 * @param isRemotePlayer
 */
export const createAvatar = (
  entity: Entity,
  spawnTransform: { position: Vector3; rotation: Quaternion },
  isRemotePlayer = false
): void => {
  const transform = addComponent(entity, TransformComponent, {
    position: new Vector3().copy(spawnTransform.position),
    rotation: new Quaternion().copy(spawnTransform.rotation),
    scale: new Vector3(1, 1, 1)
  })

  addComponent(entity, InputComponent, {
    schema: AvatarInputSchema,
    data: new Map(),
    prevData: new Map()
  })
  addComponent(entity, VelocityComponent, {
    velocity: new Vector3()
  })

  // The visuals group is centered for easy actor tilting
  const tiltContainer = new Group()
  tiltContainer.name = 'Actor (tiltContainer)' + entity
  tiltContainer.position.setY(avatarHalfHeight)

  // // Model container is used to reliably ground the actor, as animation can alter the position of the model itself
  const modelContainer = new Group()
  modelContainer.name = 'Actor (modelContainer)' + entity
  tiltContainer.add(modelContainer)

  addComponent(entity, AvatarComponent, {
    ...(Network.instance.clients[getComponent(entity, NetworkObjectComponent).uniqueId]?.avatarDetail || {
      avatarId: DEFAULT_AVATAR_ID
    }),
    avatarHalfHeight,
    avatarHeight,
    modelContainer,
    isGrounded: false,
    viewVector: new Vector3(0, 0, 1)
  })

  addComponent(entity, AnimationComponent, {
    mixer: new AnimationMixer(modelContainer),
    animations: [],
    animationSpeed: 1
  })

  addComponent(entity, AvatarAnimationComponent, {
    animationGraph: new AnimationGraph(),
    currentState: new AnimationState(),
    prevState: new AnimationState(),
    prevVelocity: new Vector3()
  })

  addComponent(entity, Object3DComponent, { value: tiltContainer })

  const raycastQuery = PhysXInstance.instance.addRaycastQuery(
    new RaycastQuery({
      type: SceneQueryType.Closest,
      origin: new Vector3(0, avatarHalfHeight, 0),
      direction: new Vector3(0, -1, 0),
      maxDistance: avatarHalfHeight + 0.05,
      collisionMask: CollisionGroups.Default | CollisionGroups.Ground | CollisionGroups.Portal
    })
  )
  addComponent(entity, RaycastComponent, { raycastQuery })

  if (isRemotePlayer) {
    const body = PhysXInstance.instance.addBody(
      new Body({
        shapes: [
          {
            shape: SHAPES.Capsule,
            options: { halfHeight: capsuleHeight / 2, radius: avatarRadius },
            config: {
              collisionLayer: CollisionGroups.Avatars,
              collisionMask: DefaultCollisionMask
            }
          }
        ],
        type: BodyType.STATIC,
        transform: {
          translation: {
            x: transform.position.x,
            y: transform.position.y + avatarHalfHeight,
            z: transform.position.z
          }
        }
      })
    )
    addComponent(entity, ColliderComponent, { body })
  } else {
    createAvatarController(entity)
  }
}

export const createAvatarController = (entity: Entity) => {
  const { position } = getComponent(entity, TransformComponent)
  const { value } = getComponent(entity, Object3DComponent)

  const controller = PhysXInstance.instance.createController(
    new Controller({
      isCapsule: true,
      collisionLayer: CollisionGroups.Avatars,
      collisionMask: DefaultCollisionMask,
      height: capsuleHeight,
      contactOffset: 0.01,
      stepOffset: 0.25,
      slopeLimit: 0,
      radius: avatarRadius,
      position: {
        x: position.x,
        y: position.y + avatarHalfHeight,
        z: position.z
      },
      material: {
        dynamicFriction: 0.1
      }
    })
  )
  const velocitySimulator = new VectorSpringSimulator(60, 50, 0.8)
  const frustumCamera = new PerspectiveCamera(60, 2, 0.1, 3)
  frustumCamera.position.setY(avatarHalfHeight)
  frustumCamera.rotateY(Math.PI)

  value.add(frustumCamera)

  addComponent(entity, AvatarControllerComponent, {
    controller,
    frustumCamera,
    movementEnabled: true,
    isJumping: false,
    isWalking: false,
    walkSpeed: 1.5,
    runSpeed: 5,
    moveSpeed: 5,
    jumpHeight: 4,
    localMovementDirection: new Vector3(),
    velocitySimulator
  })
}
