import { DEFAULT_AVATAR_ID } from '@xrengine/common/src/constants/AvatarConstants'
import { AnimationMixer, Euler, Group, Quaternion, Vector3 } from 'three'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, createEntity, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { Input } from '../../input/components/Input'
import { RelativeSpringSimulator } from '../../physics/classes/SpringSimulator'
import { VectorSpringSimulator } from '../../physics/classes/VectorSpringSimulator'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CharacterInputSchema } from '../CharacterInputSchema'
import { AnimationComponent } from '../components/AnimationComponent'
import { CharacterComponent } from '../components/CharacterComponent'
import { ControllerColliderComponent } from '../components/ControllerColliderComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { rotateViewVectorXZ } from '../../camera/systems/CameraSystem'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { Body, BodyType, Controller, PhysXInstance, RaycastQuery, SceneQueryType, SHAPES } from 'three-physx'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CharacterAnimationStateComponent } from '../components/CharacterAnimationStateComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { Network } from '../../networking/classes/Network'
import { NetworkObject } from '../../networking/components/NetworkObject'

const avatarRadius = 0.25
const capsuleHeight = 1.3

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
  entity.name = 'Player'

  const transform = addComponent(entity, TransformComponent, {
    position: new Vector3().copy(spawnTransform.position),
    rotation: new Quaternion().copy(spawnTransform.rotation)
  })

  const actor = addComponent(entity, CharacterComponent, {
    ...(Network.instance.clients[getComponent(entity, NetworkObject).uniqueId]?.avatarDetail || {
      avatarId: DEFAULT_AVATAR_ID
    })
  })
  addComponent(entity, Input, { schema: CharacterInputSchema })
  addComponent(entity, PositionalAudioComponent)
  addComponent(entity, VelocityComponent)

  // The visuals group is centered for easy actor tilting
  const obj3d = new Group()
  obj3d.name = 'Actor (tiltContainer)' + entity.id
  obj3d.position.setY(actor.actorHalfHeight)

  // // Model container is used to reliably ground the actor, as animation can alter the position of the model itself
  actor.modelContainer = new Group()
  actor.modelContainer.name = 'Actor (modelContainer)' + entity.id
  obj3d.add(actor.modelContainer, actor.frustumCamera)
  actor.frustumCamera.position.setY(actor.actorHalfHeight)
  actor.frustumCamera.rotateY(Math.PI)

  addComponent(entity, AnimationComponent, {
    mixer: new AnimationMixer(actor.modelContainer)
  })

  addComponent(entity, CharacterAnimationStateComponent)

  addComponent(entity, Object3DComponent, { value: obj3d })

  actor.velocitySimulator = new VectorSpringSimulator(
    60,
    actor.defaultVelocitySimulatorMass,
    actor.defaultVelocitySimulatorDamping
  )
  actor.moveVectorSmooth = new VectorSpringSimulator(
    60,
    actor.defaultVelocitySimulatorMass,
    actor.defaultVelocitySimulatorDamping
  )
  actor.rotationSimulator = new RelativeSpringSimulator(
    60,
    actor.defaultRotationSimulatorMass,
    actor.defaultRotationSimulatorDamping
  )

  actor.viewVector = new Vector3(0, 0, 1)

  const raycastQuery = PhysXInstance.instance.addRaycastQuery(
    new RaycastQuery({
      type: SceneQueryType.Closest,
      origin: new Vector3(0, actor.actorHalfHeight, 0),
      direction: new Vector3(0, -1, 0),
      maxDistance: actor.actorHalfHeight + 0.05,
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
              collisionLayer: CollisionGroups.Characters,
              collisionMask: DefaultCollisionMask
            }
          }
        ],
        type: BodyType.STATIC,
        transform: {
          translation: {
            x: transform.position.x,
            y: transform.position.y + actor.actorHalfHeight,
            z: transform.position.z
          }
        }
      })
    )
    addComponent(entity, ColliderComponent, { body })
  } else {
    const controller = PhysXInstance.instance.createController(
      new Controller({
        isCapsule: true,
        collisionLayer: CollisionGroups.Characters,
        collisionMask: DefaultCollisionMask,
        height: capsuleHeight,
        contactOffset: 0.01,
        stepOffset: 0.25,
        slopeLimit: 0,
        radius: avatarRadius,
        position: {
          x: transform.position.x,
          y: transform.position.y + actor.actorHalfHeight,
          z: transform.position.z
        },
        material: {
          dynamicFriction: 0.1
        }
      })
    )
    addComponent(entity, ControllerColliderComponent, { controller })
  }
}
