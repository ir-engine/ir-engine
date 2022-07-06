import { Collider, ColliderDesc, RigidBody, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import { AnimationClip, AnimationMixer, Group, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { Physics } from '../../physics/classes/PhysicsRapier'
import { VectorSpringSimulator } from '../../physics/classes/springs/VectorSpringSimulator'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { AvatarCollisionMask, CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { BodyType, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
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

  const position = createVector3Proxy(TransformComponent.position, entity)
  const rotation = createQuaternionProxy(TransformComponent.rotation, entity)
  const scale = createVector3Proxy(TransformComponent.scale, entity)

  const transform = addComponent(entity, TransformComponent, { position, rotation, scale })
  transform.position.copy(spawnAction.parameters.position)
  transform.rotation.copy(spawnAction.parameters.rotation)
  transform.scale.copy(new Vector3(1, 1, 1))

  // set cached action refs to the new components so they stay up to date with future movements
  spawnAction.parameters.position = position
  spawnAction.parameters.rotation = rotation

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
    modelContainer,
    isGrounded: false
  })

  addComponent(entity, NameComponent, {
    name: userId as string
  })

  addComponent(entity, VisibleComponent, {})

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

  addComponent(entity, RaycastComponent, {
    type: SceneQueryType.Closest,
    hits: [],
    origin: new Vector3(0, defaultAvatarHalfHeight, 0),
    direction: new Vector3(0, -1, 0),
    maxDistance: defaultAvatarHalfHeight + 0.05,
    flags: getInteractionGroups(CollisionGroups.Avatars, AvatarCollisionMask)
  })

  addComponent(entity, CollisionComponent, { collisions: [] })

  // If local player's avatar
  if (userId === Engine.instance.userId) {
    addComponent(entity, SpawnPoseComponent, {
      position: new Vector3().copy(spawnAction.parameters.position),
      rotation: new Quaternion().copy(spawnAction.parameters.rotation)
    })
    createAvatarController(entity)
  }

  return entity
}

export const createAvatarCollider = (
  entity: Entity,
  height: number,
  radius: number,
  rigidBody: RigidBody
): Collider[] => {
  const avatarControllerComponent = getComponent(entity, AvatarControllerComponent)
  const { position } = getComponent(entity, TransformComponent)
  const interactionGroups = getInteractionGroups(CollisionGroups.Avatars, AvatarCollisionMask)
  const colliders = [] as Collider[]
  const bodyColliderDesc = ColliderDesc.capsule(height, radius).setCollisionGroups(interactionGroups)
  bodyColliderDesc.translation.y = position.y + defaultAvatarHalfHeight
  const bodyCollider = Physics.createColliderAndAttachToRigidBody(
    Engine.instance.currentWorld.physicsWorld,
    bodyColliderDesc,
    rigidBody
  )

  const feetColliderHeight = height * 0.025
  const feetColliderDesc = ColliderDesc.cuboid(radius / 2, feetColliderHeight, radius / 2).setCollisionGroups(
    interactionGroups
  )
  const feetCollider = Physics.createColliderAndAttachToRigidBody(
    Engine.instance.currentWorld.physicsWorld,
    feetColliderDesc,
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
  const colliders = createAvatarCollider(entity, capsuleHeight / 2, avatarRadius, controller)
}
