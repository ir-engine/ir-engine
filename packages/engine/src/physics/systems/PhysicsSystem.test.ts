/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'
import sinon from 'sinon'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { Physics } from '../classes/Physics'
import { teleportObjectReceptor } from './PhysicsSystem'

/**
 * @todo
 */
describe('PhysicsSystem', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.physicsWorld = Physics.createWorld()
  })

  afterEach(() => {
    return destroyEngine()
  })

  // @todo this is old code, needs to be updated to new physics implementation
  it.skip('check teleportObjectReceptor', async () => {
    const action = { pose: [1, 2, 3], object: { ownerId: 0, networkId: 0 } } as any
    const entity = createEntity()

    const controller = { controller: { setPosition: () => {} } } as any
    sinon.spy(controller.controller, 'setPosition')

    addComponent(entity, AvatarControllerComponent, controller)
    const avatar = { avatarHalfHeight: 1 } as any
    addComponent(entity, AvatarComponent, avatar)

    teleportObjectReceptor(action)

    assert(controller.controller.setPosition.calledOnce)
    const setPositionArg = controller.controller.setPosition.getCall(0).args[0]
    assert(setPositionArg.x === action.pose[0])
    assert(setPositionArg.y === action.pose[1] + avatar.avatarHalfHeight)
    assert(setPositionArg.z === action.pose[2])
  })
})
