import assert, { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Engine } from '../../ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'
import { createAvatar } from './createAvatar'

describe('createAvatar', () => {
  beforeEach(async () => {
    createEngine()
    await Engine.instance.currentWorld.physics.createScene({ verbose: true })
  })

  afterEach(() => {
    delete (globalThis as any).PhysX
  })

  it('check the create avatar function', () => {
    const world = Engine.instance.currentWorld
    Engine.instance.userId = 'user' as UserId

    // mock entity to apply incoming unreliable updates to
    const entity = createEntity()

    const networkObject = addComponent(entity, NetworkObjectComponent, {
      // remote owner
      ownerId: Engine.instance.userId,
      networkId: 0 as NetworkId,
      prefab: '',
      parameters: {}
    })

    const prevPhysicsBodies = Engine.instance.currentWorld.physics.bodies.size
    const prevPhysicsColliders = Engine.instance.currentWorld.physics.controllers.size

    createAvatar(
      WorldNetworkAction.spawnAvatar({
        $from: Engine.instance.userId,
        networkId: networkObject.networkId,
        parameters: { position: new Vector3(-0.48624888685311896, 0, -0.12087574159728942), rotation: new Quaternion() }
      })
    )

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
    strictEqual(Engine.instance.currentWorld.physics.bodies.size, prevPhysicsBodies + 2)
    strictEqual(Engine.instance.currentWorld.physics.controllers.size, prevPhysicsColliders + 1)
  })
})
