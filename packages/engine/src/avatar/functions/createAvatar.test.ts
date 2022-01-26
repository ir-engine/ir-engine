import assert, { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'
import { TestNetwork } from '../../../tests/networking/TestNetwork'
import { Engine } from '../../ecs/classes/Engine'
import { createWorld } from '../../ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'
import { createAvatar } from './createAvatar'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'

describe('createAvatar', () => {
	let world
    
    beforeEach(async () => {
      /* hoist */
      Network.instance = new TestNetwork()
      world = createWorld()
      Engine.currentWorld = world
      await Engine.currentWorld.physics.createScene({ verbose: true })
    })
    
    afterEach(() => {
      Engine.currentWorld = null!
      delete (globalThis as any).PhysX
    })
    
    it('check the create avatar function', () => {
        Engine.userId = world.hostId
        Engine.hasJoinedWorld = true
        
        // mock entity to apply incoming unreliable updates to
        const entity = createEntity()
        
        const networkObject = addComponent(entity, NetworkObjectComponent, {
          // remote owner
          ownerId: Engine.userId,
          ownerIndex: 0,
          networkId: 0 as NetworkId,
          prefab: '',
          parameters: {},
        })

        const prevPhysicsBodies = Engine.currentWorld.physics.bodies.size
        const prevPhysicsColliders = Engine.currentWorld.physics.controllers.size

        createAvatar({
          prefab: 'avatar',
          parameters: { position: new Vector3(-0.48624888685311896, 0, -0.12087574159728942), rotation: new Quaternion() },
          type: 'network.SPAWN_OBJECT',
          networkId: networkObject.networkId,
          ownerIndex: 0,
          $from: Engine.userId,
          $to: 'all',
          $tick: Engine.currentWorld.fixedTick,
          $cache: true
        })
        
        assert(hasComponent(entity, TransformComponent))
        assert(hasComponent(entity, VelocityComponent))
        assert(hasComponent(entity, AvatarComponent))
        assert(hasComponent(entity, NameComponent))
        assert(hasComponent(entity, AvatarAnimationComponent))
        assert(hasComponent(entity, Object3DComponent))
        assert(hasComponent(entity, RaycastComponent))
        assert(hasComponent(entity, CollisionComponent))
        assert(hasComponent(entity, SpawnPoseComponent))
        assert(hasComponent(entity, AvatarControllerComponent))
        assert(hasComponent(entity, InteractorComponent))
        strictEqual(Engine.currentWorld.physics.bodies.size, prevPhysicsBodies + 2)
        strictEqual(Engine.currentWorld.physics.controllers.size, prevPhysicsColliders + 1)
        strictEqual(getComponent(entity, NameComponent).name, Engine.userId)
    })
})
