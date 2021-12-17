import { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'
import { TestNetwork } from '../../../tests/networking/TestNetwork'
import { Engine } from '../../ecs/classes/Engine'
import { createWorld } from '../../ecs/classes/World'
import { addComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
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
    
    it('check fi avatar schema maps sizes are ok', () => {
        Engine.userId = world.hostId
        Engine.hasJoinedWorld = true
        
        // mock entity to apply incoming unreliable updates to
        const entity = createEntity()
        
        const networkObject = addComponent(entity, NetworkObjectComponent, {
          // remote owner
          ownerId: Engine.userId,
          networkId: 0 as NetworkId,
          prefab: '',
          parameters: {},
        })

        createAvatar({
          prefab: 'avatar',
          parameters: { position: new Vector3(-0.48624888685311896, 0, -0.12087574159728942), rotation: new Quaternion() },
          type: 'network.SPAWN_OBJECT',
          networkId: networkObject.networkId,
          $from: Engine.userId,
          $to: 'all',
          $tick: Engine.currentWorld.fixedTick,
          $cache: true
        })
        
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
