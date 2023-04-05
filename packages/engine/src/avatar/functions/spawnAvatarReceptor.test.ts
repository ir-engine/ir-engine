import assert, { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'

import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import { hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEngine } from '../../initializeEngine'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '../../networking/functions/WorldNetworkActionReceptor'
import { Physics } from '../../physics/classes/Physics'
import {
  RigidBodyComponent,
  RigidBodyKinematicPositionBasedTagComponent
} from '../../physics/components/RigidBodyComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'
import { spawnAvatarReceptor } from './spawnAvatarReceptor'

describe('spawnAvatarReceptor', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.physicsWorld = Physics.createWorld()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('check the create avatar function', () => {
    Engine.instance.userId = 'user' as UserId

    // mock entity to apply incoming unreliable updates to
    const action = WorldNetworkAction.spawnAvatar({
      $from: Engine.instance.userId,
      position: new Vector3(),
      rotation: new Quaternion(),
      uuid: Engine.instance.userId
    })
    WorldNetworkActionReceptor.receiveSpawnObject(action as any)
    spawnAvatarReceptor(action)

    const entity = Engine.instance.getUserAvatarEntity(Engine.instance.userId)

    assert(hasComponent(entity, TransformComponent))
    assert(hasComponent(entity, AvatarComponent))
    assert(hasComponent(entity, NameComponent))
    assert(hasComponent(entity, AvatarAnimationComponent))
    assert(hasComponent(entity, SpawnPoseComponent))
    assert(hasComponent(entity, AvatarControllerComponent))
    assert(hasComponent(entity, LocalInputTagComponent))
    assert(hasComponent(entity, RigidBodyComponent))
    assert(hasComponent(entity, RigidBodyKinematicPositionBasedTagComponent))
    strictEqual(Engine.instance.physicsWorld.colliders.len(), 1)
  })
})
