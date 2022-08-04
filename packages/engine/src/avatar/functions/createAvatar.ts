import { Collider, ColliderDesc, RigidBody, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import { AnimationClip, AnimationMixer, Group, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { LocalAvatarTagComponent } from '../../input/components/LocalAvatarTagComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { Physics } from '../../physics/classes/Physics'
import { VectorSpringSimulator } from '../../physics/classes/springs/VectorSpringSimulator'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { AvatarCollisionMask, CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
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
    bindRig: {} as BoneStructure,
    rootYRatio: 1
  })

  addComponent(entity, Object3DComponent, { value: tiltContainer })
  setObjectLayers(tiltContainer, ObjectLayers.Avatar)

  addComponent(entity, SpawnPoseComponent, {
    position: new Vector3().copy(transform.position),
    rotation: new Quaternion().copy(transform.rotation)
  })

  if (userId === Engine.instance.userId) {
    createAvatarController(entity)
    addComponent(entity, PersistTagComponent, true)
    addComponent(entity, LocalAvatarTagComponent, true)
    addComponent(entity, LocalInputTagComponent, true)
  } else {
    createAvatarRigidBody(entity)
    createAvatarCollider(entity)
  }

  addComponent(entity, ShadowComponent, { receiveShadow: true, castShadow: true })

  return entity
}

export const createAvatarCollider = (entity: Entity): Collider => {
  const interactionGroups = getInteractionGroups(CollisionGroups.Avatars, AvatarCollisionMask)
  const avatarComponent = getComponent(entity, AvatarComponent)
  const rigidBody = getComponent(entity, RigidBodyComponent)

  const bodyColliderDesc = ColliderDesc.capsule(
    avatarComponent.avatarHalfHeight - avatarRadius,
    avatarRadius
  ).setCollisionGroups(interactionGroups)
  bodyColliderDesc.setTranslation(0, avatarComponent.avatarHalfHeight, 0)

  return Physics.createColliderAndAttachToRigidBody(
    Engine.instance.currentWorld.physicsWorld,
    bodyColliderDesc,
    rigidBody
  )
}

const createAvatarRigidBody = (entity: Entity): RigidBody => {
  const rigidBodyDesc = RigidBodyDesc.dynamic()
  const rigidBody = Physics.createRigidBody(entity, Engine.instance.currentWorld.physicsWorld, rigidBodyDesc, [])
  // rigidBody.setGravityScale(0.0, true)
  rigidBody.lockRotations(true, true)

  return rigidBody
}

export const createAvatarController = (entity: Entity) => {
  const { value } = getComponent(entity, Object3DComponent)
  const avatarComponent = getComponent(entity, AvatarComponent)

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

  // offset so rigidboyd has feet at spawn position
  const velocitySimulator = new VectorSpringSimulator(60, 50, 0.8)
  if (!hasComponent(entity, AvatarControllerComponent)) {
    getComponent(entity, TransformComponent).position.y += avatarComponent.avatarHalfHeight
    const rigidBody = createAvatarRigidBody(entity)
    addComponent(entity, AvatarControllerComponent, {
      controller: rigidBody,
      bodyCollider: undefined!,
      collisions: [false, false, false],
      movementEnabled: true,
      isJumping: false,
      isWalking: false,
      isInAir: false,
      localMovementDirection: new Vector3(),
      velocitySimulator,
      currentSpeed: 0,
      speedVelocity: { value: 0 },
      lastPosition: new Vector3() //.copy(rigidBody.translation() as Vector3)
    })
  }

  const avatarControllerComponent = getComponent(entity, AvatarControllerComponent)
  avatarControllerComponent.bodyCollider = createAvatarCollider(entity)

  addComponent(entity, CollisionComponent, new Map())
}
