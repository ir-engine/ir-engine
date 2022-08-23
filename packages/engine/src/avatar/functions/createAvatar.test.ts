import assert, { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Engine } from '../../ecs/classes/Engine'
import { hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEngine } from '../../initializeEngine'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '../../networking/functions/WorldNetworkActionReceptor'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent, RigidBodyDynamicTagComponent } from '../../physics/components/RigidBodyComponent'
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
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  it('check the create avatar function', () => {
    const world = Engine.instance.currentWorld
    Engine.instance.userId = 'user' as UserId

    // mock entity to apply incoming unreliable updates to
    const action = WorldNetworkAction.spawnAvatar({
      $from: Engine.instance.userId,
      position: new Vector3(),
      rotation: new Quaternion()
    })
    WorldNetworkActionReceptor.receiveSpawnObject(action)
    createAvatar(action)

    const entity = world.getUserAvatarEntity(Engine.instance.userId)

    // TODO: Update for rapier physics stuff
    assert(hasComponent(entity, TransformComponent))
    assert(hasComponent(entity, VelocityComponent))
    assert(hasComponent(entity, AvatarComponent))
    assert(hasComponent(entity, NameComponent))
    assert(hasComponent(entity, AvatarAnimationComponent))
    assert(hasComponent(entity, Object3DComponent))
    assert(hasComponent(entity, SpawnPoseComponent))
    assert(hasComponent(entity, AvatarControllerComponent))
    assert(hasComponent(entity, LocalInputTagComponent))
    assert(hasComponent(entity, RigidBodyComponent))
    assert(hasComponent(entity, RigidBodyDynamicTagComponent))
    strictEqual(Engine.instance.currentWorld.physicsWorld.colliders.len(), 1)
  })
})
