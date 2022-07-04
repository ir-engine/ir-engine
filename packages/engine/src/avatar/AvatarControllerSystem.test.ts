import assert from 'assert'
import sinon from 'sinon'

import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Engine } from '../ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { createEngine } from '../initializeEngine'
import { avatarControllerExit } from './AvatarControllerSystem'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'

describe('AvatarControllerSystem', async () => {
  beforeEach(async () => {
    createEngine()
  })

  it('check avatarControllerExit', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const physics = { removeController: () => {} } as any
    const worldMock = { physics } as any
    const controller = { controller: {} } as any
    const avatar = { isGrounded: true } as any

    ;(AvatarControllerComponent as any)._setPrevious(entity, controller)
    addComponent(entity, AvatarComponent, avatar)

    sinon.spy(physics, 'removeController')

    avatarControllerExit(entity, worldMock)
    assert(physics.removeController.calledOnce)
    const removeControllerCallArg = physics.removeController.getCall(0).args[0]
    assert(removeControllerCallArg === controller.controller)
    assert(avatar.isGrounded === false)
  })
})
