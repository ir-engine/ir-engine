import { AnimationClip, AnimationMixer, Group, PerspectiveCamera, Quaternion, Vector3 } from 'three'
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
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { AnimationState } from '../animations/AnimationState'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { Engine } from '../../ecs/classes/Engine'
import { BodyType, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'
import { AvatarAnimationGraph } from '../animations/AvatarAnimationGraph'
import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'

const avatarRadius = 0.25
const defaultAvatarHeight = 1.8
const capsuleHeight = defaultAvatarHeight - avatarRadius * 2
export const defaultAvatarHalfHeight = defaultAvatarHeight / 2

export const createAvatar = (spawnAction: typeof NetworkWorldAction.spawnAvatar.matches._TYPE): Entity => {
  const world = useWorld()
  const userId = spawnAction.$from
  const entity = world.getNetworkObject(spawnAction.$from, spawnAction.networkId)

  const position = createVector3Proxy(TransformComponent.position, entity)

  const rotation = createQuaternionProxy(TransformComponent.rotation, entity)
  // todo: figure out why scale makes avatar disappear
  // const scale = createVector3Proxy(TransformComponent.scale, entity)
  const scale = new Vector3().copy(new Vector3(1, 1, 1))

  const transform = addComponent(entity, TransformComponent, { position, rotation, scale })
  transform.position.copy(spawnAction.parameters.position)
  transform.rotation.copy(spawnAction.parameters.rotation)

  const velocity = createVector3Proxy(VelocityComponent.velocity, entity)

  addComponent(entity, VelocityComponent, {
    velocity
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
    ...world.clients.get(userId)?.avatarDetail,
    avatarHalfHeight: defaultAvatarHalfHeight,
    avatarHeight: defaultAvatarHeight,
    modelContainer,
    isGrounded: false
  })

  addComponent(entity, NameComponent, {
    name: userId as string
  })
  console.log('userID: ' + userId)

  addComponent(entity, AnimationComponent, {
    mixer: new AnimationMixer(modelContainer),
    animations: [] as AnimationClip[],
    animationSpeed: 1
  })

  addComponent(entity, AvatarAnimationComponent, {
    animationGraph: new AvatarAnimationGraph(),
    currentState: new AnimationState(),
    prevState: new AnimationState(),
    prevVelocity: new Vector3()
  })

  addComponent(entity, Object3DComponent, { value: tiltContainer })
  tiltContainer.traverse((o) => {
    o.layers.disable(ObjectLayers.Scene)
    o.layers.enable(ObjectLayers.Avatar)
  })

  const filterData = new PhysX.PxQueryFilterData()
  filterData.setWords(CollisionGroups.Default | CollisionGroups.Ground | CollisionGroups.Trigger, 0)
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

  // If local player's avatar
  if (userId === Engine.userId) {
    addComponent(entity, SpawnPoseComponent, {
      position: new Vector3().copy(spawnAction.parameters.position),
      rotation: new Quaternion().copy(spawnAction.parameters.rotation)
    })
    createAvatarController(entity)
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
  const world = useWorld()
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
  console.log(controller.getPosition())

  const frustumCamera = new PerspectiveCamera(60, 2, 0.1, 3)
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
      localMovementDirection: new Vector3(),
      velocitySimulator
    })
  }
}
