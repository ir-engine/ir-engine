import { DEFAULT_AVATAR_ID } from '@xrengine/common/src/constants/AvatarConstants'
import { AnimationMixer, Group, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { VectorSpringSimulator } from '../../physics/classes/springs/VectorSpringSimulator'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarInputSchema } from '../AvatarInputSchema'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { AnimationGraph } from '../animations/AnimationGraph'
import { AnimationState } from '../animations/AnimationState'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { isClient } from '../../common/functions/isClient'
import { isBot } from '../../common/functions/isBot'
import { AfkCheckComponent } from '../../navigation/component/AfkCheckComponent'
import { World } from '../../ecs/classes/World'
import { BodyType, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { ProximityComponent } from '../../proximityChecker/components/ProximityComponent '

const avatarRadius = 0.25
const avatarHeight = 1.8
const capsuleHeight = avatarHeight - avatarRadius * 2
const avatarHalfHeight = avatarHeight / 2

/**
 *
 * @param {Entity} entity
 * @param {string} uniqueId
 * @param {networkId} networkId
 * @param isRemotePlayer
 */
export const createAvatar = (
  world: World,
  entity: Entity,
  spawnTransform: { position: Vector3; rotation: Quaternion },
  isRemotePlayer = true
): void => {
  if (isClient) {
    if (isBot(window) && !hasComponent(entity, ProximityComponent))
      addComponent(entity, ProximityComponent, {
        usersInRange: [],
        usersInIntimateRange: [],
        usersInHarassmentRange: [],
        usersLookingTowards: []
      })
    if (!hasComponent(entity, AfkCheckComponent))
      addComponent(entity, AfkCheckComponent, {
        isAfk: false,
        prevPosition: new Vector3(0, 0, 0),
        cStep: 0,
        timer: 0
      })
  }
  const transform = addComponent(entity, TransformComponent, {
    position: new Vector3().copy(spawnTransform.position),
    rotation: new Quaternion().copy(spawnTransform.rotation),
    scale: new Vector3(1, 1, 1)
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
    isGrounded: false
  })

  addComponent(entity, NameComponent, {
    name: Network.instance.clients[getComponent(entity, NetworkObjectComponent).uniqueId]?.userId
  })
  console.log('uniqueID: ' + getComponent(entity, NetworkObjectComponent).uniqueId)
  console.log('userID: ' + Network.instance.clients[getComponent(entity, NetworkObjectComponent).uniqueId]?.userId)

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

  const filterData = new PhysX.PxQueryFilterData()
  filterData.setWords(CollisionGroups.Default | CollisionGroups.Ground | CollisionGroups.Trigger, 0)
  const flags = PhysX.PxQueryFlag.eSTATIC.value | PhysX.PxQueryFlag.eDYNAMIC.value | PhysX.PxQueryFlag.eANY_HIT.value
  filterData.setFlags(flags)

  addComponent(entity, RaycastComponent, {
    filterData,
    type: SceneQueryType.Closest,
    hits: [],
    origin: new Vector3(0, avatarHalfHeight, 0),
    direction: new Vector3(0, -1, 0),
    maxDistance: avatarHalfHeight + 0.05,
    flags
  })

  addComponent(entity, CollisionComponent, { collisions: [] })

  if (isRemotePlayer) {
    const shape = world.physics.createShape(
      new PhysX.PxCapsuleGeometry(avatarRadius, capsuleHeight / 2),
      world.physics.physics.createMaterial(0, 0, 0),
      {
        collisionLayer: CollisionGroups.Avatars,
        collisionMask: DefaultCollisionMask
      }
    )
    const body = world.physics.addBody({
      shapes: [shape],
      type: BodyType.STATIC,
      transform: {
        translation: {
          x: transform.position.x,
          y: transform.position.y + avatarHalfHeight,
          z: transform.position.z
        },
        rotation: new Quaternion()
      },
      userData: {
        entity
      }
    })
    addComponent(entity, ColliderComponent, { body })
  } else {
    createAvatarController(entity)
  }
}

export const createAvatarController = (entity: Entity) => {
  const { position } = getComponent(entity, TransformComponent)
  const { value } = getComponent(entity, Object3DComponent)

  addComponent(entity, InputComponent, {
    schema: AvatarInputSchema,
    data: new Map()
  })
  const world = useWorld()
  const controller = world.physics.createController({
    isCapsule: true,
    material: world.physics.createMaterial(),
    position: {
      x: position.x,
      y: position.y + avatarHalfHeight,
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
  })

  const frustumCamera = new PerspectiveCamera(60, 2, 0.1, 3)
  frustumCamera.position.setY(avatarHalfHeight)
  frustumCamera.rotateY(Math.PI)

  value.add(frustumCamera)
  addComponent(entity, InteractorComponent, {
    focusedInteractive: null,
    frustumCamera,
    subFocusedArray: []
  })

  const velocitySimulator = new VectorSpringSimulator(60, 50, 0.8)
  addComponent(entity, AvatarControllerComponent, {
    controller,
    filterData: new PhysX.PxFilterData(CollisionGroups.Avatars, DefaultCollisionMask | CollisionGroups.Trigger, 0, 0),
    collisions: [false, false, false],
    movementEnabled: true,
    isJumping: false,
    isWalking: false,
    localMovementDirection: new Vector3(),
    velocitySimulator
  })
}
