import assert, { strictEqual } from 'assert'
import { PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { getState } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { createEngine } from '../../initializeEngine'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '../../networking/functions/WorldNetworkActionReceptor'
import { Physics } from '../../physics/classes/Physics'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { createAvatar } from './createAvatar'
import { moveAvatarWithVelocity } from './moveAvatar'

// @todo this test is exhibiting odd behaviour
describe('moveAvatar function tests', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  it('should apply world.fixedDelta @ 60 tick to avatar movement, consistent with physics simulation', () => {
    const world = Engine.instance.currentWorld
    const engineState = getState(EngineState)
    engineState.fixedDeltaSeconds.set(1000 / 60)

    const spawnAvatar = WorldNetworkAction.spawnAvatar({
      $from: Engine.instance.userId,
      position: new Vector3(),
      rotation: new Quaternion()
    })

    WorldNetworkActionReceptor.receiveSpawnObject(spawnAvatar, world)

    const entity = createAvatar(spawnAvatar)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)
    const avatar = getComponent(entity, AvatarControllerComponent)

    avatar.localMovementDirection.setZ(-1)

    // velocity starts at 0
    strictEqual(velocity.linear.x, 0)
    strictEqual(velocity.linear.z, 0)

    /* run */
    moveAvatarWithVelocity(entity)

    /* assert */
  })

  it('should apply world.fixedDelta @ 120 tick to avatar movement, consistent with physics simulation', () => {
    const world = Engine.instance.currentWorld
    const engineState = getState(EngineState)
    engineState.fixedDeltaSeconds.set(1000 / 60)

    const spawnAvatar = WorldNetworkAction.spawnAvatar({
      $from: Engine.instance.userId,
      position: new Vector3(),
      rotation: new Quaternion()
    })

    WorldNetworkActionReceptor.receiveSpawnObject(spawnAvatar, world)

    const entity = createAvatar(spawnAvatar)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)

    // velocity starts at 0
    strictEqual(velocity.linear.x, 0)
    strictEqual(velocity.linear.z, 0)

    /* run */
    moveAvatarWithVelocity(entity)

    /* assert */
  })

  it('should take world.physics.timeScale into account when moving avatars, consistent with physics simulation', () => {
    Engine.instance.userId = 'user' as UserId

    const world = Engine.instance.currentWorld
    const engineState = getState(EngineState)
    engineState.fixedDeltaSeconds.set(1000 / 60)

    /* mock */
    world.physicsWorld.timestep = 1 / 2

    const spawnAvatar = WorldNetworkAction.spawnAvatar({
      $from: Engine.instance.userId,
      position: new Vector3(),
      rotation: new Quaternion()
    })

    WorldNetworkActionReceptor.receiveSpawnObject(spawnAvatar, world)

    const entity = createAvatar(spawnAvatar)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)

    // velocity starts at 0
    strictEqual(velocity.linear.x, 0)
    strictEqual(velocity.linear.z, 0)

    /* run */
    moveAvatarWithVelocity(entity)

    /* assert */
  })

  it('should not allow velocity to breach a full unit through multiple frames', () => {
    Engine.instance.userId = 'user' as UserId

    const world = Engine.instance.currentWorld
    const engineState = getState(EngineState)
    engineState.fixedDeltaSeconds.set(1000 / 60)

    const spawnAvatar = WorldNetworkAction.spawnAvatar({
      $from: Engine.instance.userId,
      position: new Vector3(),
      rotation: new Quaternion()
    })

    WorldNetworkActionReceptor.receiveSpawnObject(spawnAvatar, world)

    const entity = createAvatar(spawnAvatar)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)

    // velocity starts at 0
    strictEqual(velocity.linear.x, 0)
    strictEqual(velocity.linear.z, 0)

    /* run */
    moveAvatarWithVelocity(entity)
    Engine.instance.currentWorld.physicsWorld.step()
    moveAvatarWithVelocity(entity)
    Engine.instance.currentWorld.physicsWorld.step()
    moveAvatarWithVelocity(entity)
    Engine.instance.currentWorld.physicsWorld.step()
    moveAvatarWithVelocity(entity)
    Engine.instance.currentWorld.physicsWorld.step()
    moveAvatarWithVelocity(entity)
    Engine.instance.currentWorld.physicsWorld.step()
    moveAvatarWithVelocity(entity)

    /* assert */
  })
})
