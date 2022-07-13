import { AnimationClip, AnimationMixer, Group, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { AudioTagComponent } from '../../audio/components/AudioTagComponent'
import { isClient } from '../../common/functions/isClient'
import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { VectorSpringSimulator } from '../../physics/classes/springs/VectorSpringSimulator'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { AvatarCollisionMask, CollisionGroups } from '../../physics/enums/CollisionGroups'
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

const avatarRadius = 0.25
export const defaultAvatarHeight = 1.8
const capsuleHeight = defaultAvatarHeight - avatarRadius * 2
export const defaultAvatarHalfHeight = defaultAvatarHeight / 2

export const createAvatar = (spawnAction: typeof WorldNetworkAction.spawnAvatar.matches._TYPE): Entity => {
  const world = Engine.instance.currentWorld
  const userId = spawnAction.$from
  const entity = world.getNetworkObject(spawnAction.$from, spawnAction.networkId)!

  const transform = getComponent(entity, TransformComponent)

  const linearVelocity = createVector3Proxy(VelocityComponent.linear, entity)
  const angularVelocity = createVector3Proxy(VelocityComponent.angular, entity)

  addComponent(entity, VelocityComponent, {
    linear: linearVelocity,
    angular: angularVelocity
  })

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

  const filterData = new PhysX.PxQueryFilterData()
  filterData.setWords(AvatarCollisionMask, 0)
  const flags = PhysX.PxQueryFlag.eSTATIC.value | PhysX.PxQueryFlag.eDYNAMIC.value | PhysX.PxQueryFlag.eANY_HIT.value
  filterData.setFlags(flags)

  addComponent(entity, RaycastComponent, {
    filterData,
    type: SceneQueryType.Closest,
    hits: [],
    origin: new Vector3(0, defaultAvatarHalfHeight, 0),
    direction: new Vector3(0, -1, 0),
    maxDistance: defaultAvatarHalfHeight + 0.05,
    flags
  })

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

  const shape = world.physics.createShape(
    new PhysX.PxCapsuleGeometry(avatarRadius, capsuleHeight / 2),
    world.physics.physics.createMaterial(0, 0, 0),
    {
      collisionLayer: CollisionGroups.Avatars,
      collisionMask: CollisionGroups.Default | CollisionGroups.Ground | CollisionGroups.Trigger
    }
  )

  const body = world.physics.addBody({
    shapes: [shape],
    type: BodyType.DYNAMIC,
    transform: {
      translation: {
        x: transform.position.x,
        y: transform.position.y + defaultAvatarHalfHeight,
        z: transform.position.z
      },
      rotation: new Quaternion()
    },
    userData: {
      entity
    }
  })
  body.setActorFlag(PhysX.PxActorFlag.eDISABLE_GRAVITY, true)
  addComponent(entity, ColliderComponent, { body })

  addComponent(entity, PersistTagComponent, true)

  return entity
}

export const createAvatarController = (entity: Entity) => {
  const { position } = getComponent(entity, TransformComponent)
  const { value } = getComponent(entity, Object3DComponent)

  if (!hasComponent(entity, InputComponent)) {
    addComponent(entity, InputComponent, {
      schema: AvatarInputSchema,
      data: new Map()
    })
  }
  const world = Engine.instance.currentWorld
  const controller = world.physics.createController({
    isCapsule: true,
    material: world.physics.createMaterial(),
    position: {
      x: position.x,
      y: position.y + defaultAvatarHalfHeight,
      z: position.z
    },
    contactOffset: 0.01,
    stepOffset: 0.25,
    slopeLimit: 0,
    height: capsuleHeight,
    radius: avatarRadius,
    userData: {
      entity
    }
  }) as PhysX.PxCapsuleController

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

  const velocitySimulator = new VectorSpringSimulator(60, 50, 0.8)
  if (!hasComponent(entity, AvatarControllerComponent)) {
    addComponent(entity, AvatarControllerComponent, {
      controller,
      filterData: new PhysX.PxFilterData(
        CollisionGroups.Avatars,
        CollisionGroups.Default | CollisionGroups.Ground | CollisionGroups.Trigger,
        0,
        0
      ),
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
}
