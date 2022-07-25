import assert from 'assert'
import sinon from 'sinon'
import { Vector3 } from 'three'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { Physics } from '../classes/Physics'
import { VelocityComponent } from '../components/VelocityComponent'
import { teleportObjectReceptor } from './PhysicsSystem'

/**
 * @todo
 */
describe('PhysicsSystem', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  // @todo this is old code, needs to be updated to new physics implementation
  it.skip('check teleportObjectReceptor', async () => {
    const action = { pose: [1, 2, 3], object: { ownerId: 0, networkId: 0 } } as any
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const worldStub = { getNetworkObject: () => entity } as any

    const controller = { controller: { setPosition: () => {} } } as any
    sinon.spy(controller.controller, 'setPosition')

    addComponent(entity, AvatarControllerComponent, controller)
    const avatar = { avatarHalfHeight: 1 } as any
    addComponent(entity, AvatarComponent, avatar)
    const velocity = { linear: new Vector3().setScalar(1), angular: new Vector3().setScalar(1) } as any
    addComponent(entity, VelocityComponent, velocity)

    teleportObjectReceptor(action, worldStub)

    assert(controller.controller.setPosition.calledOnce)
    const setPositionArg = controller.controller.setPosition.getCall(0).args[0]
    assert(setPositionArg.x === action.pose[0])
    assert(setPositionArg.y === action.pose[1] + avatar.avatarHalfHeight)
    assert(setPositionArg.z === action.pose[2])
    assert(velocity.linear.length() === 0)
    assert(velocity.angular.length() === 0)
  })
})
