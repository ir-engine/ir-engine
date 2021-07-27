import { DEFAULT_AVATAR_ID } from '@xrengine/common/src/constants/AvatarConstants'
import { AnimationMixer, Group, Quaternion, Vector3 } from 'three'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { isClient } from '../../common/functions/isClient'
import { Behavior } from '../../common/interfaces/Behavior'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
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
import { addObject3DComponent } from '../../scene/behaviors/addObject3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CharacterInputSchema } from '../CharacterInputSchema'
import { AnimationComponent } from '../components/AnimationComponent'
import { CharacterComponent } from '../components/CharacterComponent'
import { ControllerColliderComponent } from '../components/ControllerColliderComponent'
import { NamePlateComponent } from '../components/NamePlateComponent'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import type { NetworkObject } from '../../networking/components/NetworkObject'

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
    mixer: new AnimationMixer(actor.modelContainer),
    animationVectorSimulator: new VectorSpringSimulator(
      60,
      actor.defaultVelocitySimulatorMass,
      actor.defaultVelocitySimulatorDamping
    )
  })

  addObject3DComponent(entity, obj3d)

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

  addComponent(entity, ControllerColliderComponent)
}

export const teleportPlayer = (playerEntity: Entity, position: Vector3, rotation: Quaternion): void => {
  const playerCollider = getMutableComponent(playerEntity, ControllerColliderComponent)
  const actor = getMutableComponent(playerEntity, CharacterComponent)

  const pos = position.clone()
  pos.y += actor.actorHalfHeight
  playerCollider.controller.updateTransform({
    translation: pos,
    rotation
  })
  playerCollider.controller.velocity.setScalar(0)
}

export function createNetworkPlayer(args: {
  parameters: { position; rotation }
  ownerId: string | number
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
    { type: NamePlateComponent },
    { type: PositionalAudioComponent }
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
    { type: InterpolationComponent }
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
