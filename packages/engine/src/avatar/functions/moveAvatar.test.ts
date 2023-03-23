import assert, { strictEqual } from 'assert'
import { PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { getMutableState } from '@etherealengine/hyperflux'

import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { createEngine } from '../../initializeEngine'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '../../networking/functions/WorldNetworkActionReceptor'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent, RigidBodyFixedTagComponent } from '../../physics/components/RigidBodyComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { applyGamepadInput } from './moveAvatar'
import { spawnAvatarReceptor } from './spawnAvatarReceptor'

describe('moveAvatar function tests', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.physicsWorld = Physics.createWorld()
    Engine.instance.userId = 'userId' as UserId
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should apply world.fixedDelta @ 60 tick to avatar movement, consistent with physics simulation', () => {
    const engineState = getMutableState(EngineState)
    engineState.fixedDeltaSeconds.set(1000 / 60)

    const spawnAvatar = WorldNetworkAction.spawnAvatar({
      $from: Engine.instance.userId,
      position: new Vector3(),
      rotation: new Quaternion()
    })

    WorldNetworkActionReceptor.receiveSpawnObject(spawnAvatar)

    spawnAvatarReceptor(spawnAvatar)
    const entity = Engine.instance.getUserAvatarEntity(Engine.instance.userId)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity
    const avatar = getComponent(entity, AvatarControllerComponent)

    avatar.gamepadWorldMovement.setZ(-1)

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    /* assert */
  })

  it('should apply world.fixedDelta @ 120 tick to avatar movement, consistent with physics simulation', () => {
    const engineState = getMutableState(EngineState)
    engineState.fixedDeltaSeconds.set(1000 / 60)

    const spawnAvatar = WorldNetworkAction.spawnAvatar({
      $from: Engine.instance.userId,
      position: new Vector3(),
      rotation: new Quaternion()
    })

    WorldNetworkActionReceptor.receiveSpawnObject(spawnAvatar)

    spawnAvatarReceptor(spawnAvatar)
    const entity = Engine.instance.getUserAvatarEntity(Engine.instance.userId)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    /* assert */
  })

  it('should take world.physics.timeScale into account when moving avatars, consistent with physics simulation', () => {
    Engine.instance.userId = 'user' as UserId

    const engineState = getMutableState(EngineState)
    engineState.fixedDeltaSeconds.set(1000 / 60)

    /* mock */
    Engine.instance.physicsWorld.timestep = 1 / 2

    const spawnAvatar = WorldNetworkAction.spawnAvatar({
      $from: Engine.instance.userId,
      position: new Vector3(),
      rotation: new Quaternion()
    })

    WorldNetworkActionReceptor.receiveSpawnObject(spawnAvatar)

    spawnAvatarReceptor(spawnAvatar)
    const entity = Engine.instance.getUserAvatarEntity(Engine.instance.userId)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    /* assert */
  })

  it('should not allow velocity to breach a full unit through multiple frames', () => {
    Engine.instance.userId = 'user' as UserId

    const engineState = getMutableState(EngineState)
    engineState.fixedDeltaSeconds.set(1000 / 60)

    const spawnAvatar = WorldNetworkAction.spawnAvatar({
      $from: Engine.instance.userId,
      position: new Vector3(),
      rotation: new Quaternion()
    })

    WorldNetworkActionReceptor.receiveSpawnObject(spawnAvatar)

    spawnAvatarReceptor(spawnAvatar)
    const entity = Engine.instance.getUserAvatarEntity(Engine.instance.userId)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)
    Engine.instance.physicsWorld.step()
    applyGamepadInput(entity)
    Engine.instance.physicsWorld.step()
    applyGamepadInput(entity)
    Engine.instance.physicsWorld.step()
    applyGamepadInput(entity)
    Engine.instance.physicsWorld.step()
    applyGamepadInput(entity)
    Engine.instance.physicsWorld.step()
    applyGamepadInput(entity)

    /* assert */
  })
})
