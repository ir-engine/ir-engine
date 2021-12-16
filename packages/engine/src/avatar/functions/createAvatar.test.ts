import assert, { strictEqual } from 'assert'
import { AnimationClip, AnimationMixer, Group, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { createWorld } from '../../ecs/classes/World'
import { addComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { BodyType, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AnimationState } from '../animations/AnimationState'
import { AvatarAnimationGraph } from '../animations/AvatarAnimationGraph'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'
import { avatarHalfHeight, avatarHeight, avatarRadius, capsuleHeight, createAvatarController } from './createAvatar'

const createAvatar = (world, pos, rot): Entity => {
    const entity = createEntity(world)
  
    const position = createVector3Proxy(TransformComponent.position, entity)

    const rotation = createQuaternionProxy(TransformComponent.rotation, entity)
    const scale = new Vector3().copy(new Vector3(1, 1, 1))
    const transform = addComponent(entity, TransformComponent, { position, rotation, scale })
    transform.position.copy(pos)
    transform.rotation.copy(rot)

    const velocity = createVector3Proxy(VelocityComponent.velocity, entity)
    addComponent(entity, VelocityComponent, { velocity })

    const tiltContainer = new Group()
    tiltContainer.name = 'Actor (tiltContainer)' + entity
    tiltContainer.position.setY(avatarHalfHeight)

    const modelContainer = new Group()
    modelContainer.name = 'Actor (modelContainer)' + entity
    tiltContainer.add(modelContainer)

    addComponent(entity, AvatarComponent, {
        undefined,
        avatarHalfHeight,
        avatarHeight,
        modelContainer,
        isGrounded:false
    })

    addComponent(entity, NameComponent, { name: 'test' })
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
      origin: new Vector3(0, avatarHalfHeight, 0),
      direction: new Vector3(0, -1, 0),
      maxDistance: avatarHalfHeight + 0.05,
      flags
    })

    addComponent(entity, CollisionComponent, { collisions: [] })
    

    addComponent(entity, SpawnPoseComponent, {
        position: new Vector3().copy(pos),
        rotation: new Quaternion().copy(rot)
      })
      createAvatarController(entity)
    
    const shape = world.physics.createShape(
        new PhysX.PxCapsuleGeometry(avatarRadius, capsuleHeight / 2),
        world.physics.physics.createMaterial(0, 0, 0),
        {
          collisionLayer: CollisionGroups.Avatars,
          collisionMask: CollisionGroups.Default | CollisionGroups.Ground
        }
      )
      const body = world.physics.addBody({
        shapes: [shape],
        type: BodyType.DYNAMIC,
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
      body.setActorFlag(PhysX.PxActorFlag.eDISABLE_GRAVITY, true)
      addComponent(entity, ColliderComponent, { body })

    return entity
  }

describe('createAvatar', () => {
	let world
    
    beforeEach(async () => {
            world = createWorld()
            Engine.currentWorld = world
        await world.physics.createScene()
        })
    
    it('check fi avatar schema maps sizes are ok', () => {
        const entity = createAvatar(world, new Vector3(0, 0, 0), new Quaternion())
        
        strictEqual(hasComponent(entity, TransformComponent), true)
        strictEqual(hasComponent(entity, VelocityComponent), true)
        strictEqual(hasComponent(entity, AvatarComponent), true)
        strictEqual(hasComponent(entity, NameComponent), true)
        strictEqual(hasComponent(entity, AvatarAnimationComponent), true)
        strictEqual(hasComponent(entity, Object3DComponent), true)
        strictEqual(hasComponent(entity, RaycastComponent), true)
        strictEqual(hasComponent(entity, CollisionComponent), true)
        strictEqual(hasComponent(entity, SpawnPoseComponent), true)
    })
})
