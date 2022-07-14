import { Collider, ColliderDesc, RigidBody, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import { AnimationClip, AnimationMixer, Group, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { AudioTagComponent } from '../../audio/components/AudioTagComponent'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { Physics } from '../../physics/classes/PhysicsRapier'
import { VectorSpringSimulator } from '../../physics/classes/springs/VectorSpringSimulator'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { AvatarCollisionMask, CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { BodyType, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { ShadowComponent } from '../../scene/components/ShadowComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoneStructure } from '../AvatarBoneMatching'
import { AvatarInputSchema } from '../AvatarInputSchema'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'

export const avatarRadius = 0.25
export const defaultAvatarHeight = 1.8
const capsuleHeight = defaultAvatarHeight - avatarRadius * 2
export const defaultAvatarHalfHeight = defaultAvatarHeight / 2

export const createAvatar = (spawnAction: typeof WorldNetworkAction.spawnAvatar.matches._TYPE): Entity => {
  const world = Engine.instance.currentWorld
  const userId = spawnAction.$from
  const entity = world.getNetworkObject(spawnAction.$from, spawnAction.networkId)!

  const transform = getComponent(entity, TransformComponent)

  // The visuals group is centered for easy actor tilting
  const tiltContainer = new Group()
  tiltContainer.name = 'Actor (tiltContainer)' + entity
  tiltContainer.position.setY(defaultAvatarHalfHeight)

  // // Model container is used to reliably ground the actor, as animation can alter the position of the model itself
  const modelContainer = new Group()
  modelContainer.name = 'Actor (modelContainer)' + entity
  tiltContainer.add(modelContainer)

  addComponent(entity, AvatarComponent, {
    avatarHalfHeight: defaultAvatarHalfHeight,
    avatarHeight: defaultAvatarHeight,
    modelContainer
  })

  addComponent(entity, NameComponent, {
    name: ('avatar_' + userId) as string
  })

  addComponent(entity, VisibleComponent, true)

  addComponent(entity, AnimationComponent, {
    mixer: new AnimationMixer(modelContainer),
    animations: [] as AnimationClip[],
    animationSpeed: 1
  })

  addComponent(entity, AvatarAnimationComponent, {
    animationGraph: {
      states: {},
      transitionRules: {},
      currentState: null!,
      stateChanged: null!
    },
    rig: {} as BoneStructure,
    rootYRatio: 1
  })

  addComponent(entity, Object3DComponent, { value: tiltContainer })
  setObjectLayers(tiltContainer, ObjectLayers.Avatar)

  addComponent(entity, CollisionComponent, { collisions: [] })

  addComponent(entity, SpawnPoseComponent, {
    position: new Vector3().copy(transform.position),
    rotation: new Quaternion().copy(transform.rotation)
  })

  if (userId === Engine.instance.userId) {
    createAvatarController(entity)
    addComponent(entity, LocalInputTagComponent, {})
  }

  if (isClient) {
    addComponent(entity, AudioTagComponent, {})
    addComponent(entity, ShadowComponent, { receiveShadow: true, castShadow: true })
  }

  addComponent(entity, PersistTagComponent, true)

  return entity
}

export const createAvatarCollider = (
  entity: Entity,
  halfHeight: number,
  radius: number,
  rigidBody: RigidBody,
  center: Vector3
): Collider[] => {
  const avatarControllerComponent = getComponent(entity, AvatarControllerComponent)
  const interactionGroups = getInteractionGroups(CollisionGroups.Avatars, AvatarCollisionMask)
  const colliders = [] as Collider[]

  const feetColliderHeight = halfHeight * 0.025
  const feetColliderDesc = ColliderDesc.cuboid(radius / 2, feetColliderHeight, radius / 2).setCollisionGroups(
    interactionGroups
  )
  feetColliderDesc.setTranslation(0, center.y - halfHeight - radius, 0)
  const feetCollider = Physics.createColliderAndAttachToRigidBody(
    Engine.instance.currentWorld.physicsWorld,
    feetColliderDesc,
    rigidBody
  )

  const bodyColliderDesc = ColliderDesc.capsule(halfHeight, radius).setCollisionGroups(interactionGroups)
  bodyColliderDesc.setTranslation(0, center.y, 0)
  const bodyCollider = Physics.createColliderAndAttachToRigidBody(
    Engine.instance.currentWorld.physicsWorld,
    bodyColliderDesc,
    rigidBody
  )

  avatarControllerComponent.bodyCollider = bodyCollider
  avatarControllerComponent.feetCollider = feetCollider

  colliders.push(bodyCollider, feetCollider)

  return colliders
}

const createAvatarRigidBody = (entity: Entity, height: number, radius: number): RigidBody => {
  const rigidBodyDesc = RigidBodyDesc.dynamic()
  const rigidBody = Physics.createRigidBody(entity, Engine.instance.currentWorld.physicsWorld, rigidBodyDesc, [])
  rigidBody.setGravityScale(0.0, true)
  rigidBody.lockRotations(true, true)

  return rigidBody
}

export const createAvatarController = (entity: Entity) => {
  const { value } = getComponent(entity, Object3DComponent)

  if (!hasComponent(entity, InputComponent)) {
    addComponent(entity, InputComponent, {
      schema: AvatarInputSchema,
      data: new Map()
    })
  }

  const frustumCamera = new PerspectiveCamera(60, 4, 0.1, 3)
  frustumCamera.position.setY(defaultAvatarHalfHeight)
  frustumCamera.rotateY(Math.PI)

  value.add(frustumCamera)
  if (!hasComponent(entity, InteractorComponent)) {
    addComponent(entity, InteractorComponent, {
      focusedInteractive: null!,
      frustumCamera,
      subFocusedArray: []
    })
  }

  const controller = createAvatarRigidBody(entity, capsuleHeight / 2, avatarRadius)
  const velocitySimulator = new VectorSpringSimulator(60, 50, 0.8)
  if (!hasComponent(entity, AvatarControllerComponent)) {
    addComponent(entity, AvatarControllerComponent, {
      controller,
      bodyCollider: undefined!,
      feetCollider: undefined!,
      collisions: [false, false, false],
      movementEnabled: true,
      isJumping: false,
      isWalking: false,
      isInAir: false,
      localMovementDirection: new Vector3(),
      velocitySimulator,
      currentSpeed: 0,
      speedVelocity: { value: 0 }
    })
  }

  const { position } = getComponent(entity, TransformComponent)
  const colliders = createAvatarCollider(
    entity,
    capsuleHeight / 2,
    avatarRadius,
    controller,
    new Vector3().setY(position.y + defaultAvatarHalfHeight)
  )
}
