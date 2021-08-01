import { DEFAULT_AVATAR_ID } from '@xrengine/common/src/constants/AvatarConstants'
import { AnimationMixer, Euler, Group, Quaternion, Vector3 } from 'three'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { isClient } from '../../common/functions/isClient'
import { Behavior } from '../../common/interfaces/Behavior'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { Input } from '../../input/components/Input'
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver'
import { Interactor } from '../../interaction/components/Interactor'
import { Network } from '../../networking/classes/Network'
import { initializeNetworkObject } from '../../networking/functions/initializeNetworkObject'
import { NetworkPrefab } from '../../networking/interfaces/NetworkPrefab'
import { PrefabType } from '../../networking/templates/PrefabType'
import { RelativeSpringSimulator } from '../../physics/classes/SpringSimulator'
import { VectorSpringSimulator } from '../../physics/classes/VectorSpringSimulator'
import { InterpolationComponent } from '../../physics/components/InterpolationComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CharacterInputSchema } from '../CharacterInputSchema'
import { AnimationComponent } from '../components/AnimationComponent'
import { CharacterComponent } from '../components/CharacterComponent'
import { ControllerColliderComponent } from '../components/ControllerColliderComponent'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import type { NetworkObject } from '../../networking/components/NetworkObject'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { rotateViewVectorXZ } from '../../camera/systems/CameraSystem'
import { ShadowComponent } from '../../scene/components/ShadowComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { Body, BodyType, Controller, PhysXInstance, RaycastQuery, SceneQueryType, SHAPES } from 'three-physx'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CharacterAnimationStateComponent } from '../components/CharacterAnimationStateComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'

const avatarRadius = 0.25
const capsuleHeight = 1.3

const initializeCharacter: Behavior = (entity): void => {
  entity.name = 'Player'

  const actor = getMutableComponent(entity, CharacterComponent)

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

  const transform = getComponent(entity, TransformComponent)

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

  if (!isClient || hasComponent(entity, LocalInputReceiver)) {
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
  } else {
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
  }
}

export const teleportPlayer = (playerEntity: Entity, position: Vector3, rotation: Quaternion): void => {
  const controller = getMutableComponent(playerEntity, ControllerColliderComponent)
  const actor = getMutableComponent(playerEntity, CharacterComponent)

  if (!(rotation instanceof Quaternion)) {
    rotation = new Quaternion((rotation as any).x, (rotation as any).y, (rotation as any).z, (rotation as any).w)
  }

  const pos = new Vector3(position.x, position.y, position.z)
  pos.y += actor.actorHalfHeight
  controller.controller.updateTransform({
    translation: pos,
    rotation
  })

  const euler = new Euler().setFromQuaternion(rotation)
  rotateViewVectorXZ(actor.viewVector, euler.y)
  controller.controller.velocity.setScalar(0)
}

export function createNetworkPlayer(args: {
  ownerId: string | number
  parameters?: { position; rotation }
  networkId?: number
  entity?: Entity
}): NetworkObject {
  console.log('createNetworkPlayer', args)
  const position = new Vector3()
  const rotation = new Quaternion()
  if (args.parameters) {
    position.set(args.parameters.position.x, args.parameters.position.y, args.parameters.position.z)
    rotation.set(
      args.parameters.rotation.x,
      args.parameters.rotation.y,
      args.parameters.rotation.z,
      args.parameters.rotation.w
    )
  }
  const networkComponent = initializeNetworkObject({
    entity: args.entity,
    ownerId: String(args.ownerId),
    uniqueId: String(args.ownerId),
    networkId: args.networkId,
    prefabType: PrefabType.Player,
    parameters: args.parameters,
    override: {
      localClientComponents: [],
      networkComponents: [
        {
          type: TransformComponent,
          data: { position, rotation }
        },
        {
          type: CharacterComponent,
          data: { ...(Network.instance.clients[args.ownerId]?.avatarDetail ?? {}) }
        }
      ],
      serverComponents: []
    }
  })
  if (!isClient) {
    Network.instance.worldState.createObjects.push({
      networkId: networkComponent.networkId,
      ownerId: networkComponent.ownerId,
      prefabType: PrefabType.Player,
      uniqueId: networkComponent.uniqueId,
      parameters: args.parameters
    })
  }
  return networkComponent
}

// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkPlayerCharacter: NetworkPrefab = {
  initialize: createNetworkPlayer,
  // These will be created for all players on the network
  networkComponents: [
    // ActorComponent has values like movement speed, deceleration, jump height, etc
    { type: CharacterComponent, data: { avatarId: DEFAULT_AVATAR_ID || 'default' } }, // TODO: add to environment
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    // Local player input mapped to behaviors in the input map
    { type: Input, data: { schema: CharacterInputSchema } },
    { type: PositionalAudioComponent },
    { type: VelocityComponent }
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [
    { type: LocalInputReceiver },
    { type: FollowCameraComponent },
    { type: Interactor },
    { type: PersistTagComponent }
  ],
  clientComponents: [
    // Its component is a pass to Interpolation for Other Players and Serrver Correction for Your Local Player
    { type: InterpolationComponent },
    { type: ShadowComponent }
  ],
  serverComponents: [],
  onAfterCreate: [
    {
      behavior: initializeCharacter,
      networked: true
    }
  ],
  onBeforeDestroy: []
}
