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

import { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { applyIncomingActions, dispatchAction, getMutableState, receiveActions } from '@etherealengine/hyperflux'

import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { createEngine } from '../../initializeEngine'
import { EntityNetworkState } from '../../networking/state/EntityNetworkState'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarNetworkAction } from '../state/AvatarNetworkState'
import { applyGamepadInput } from './moveAvatar'
import { spawnAvatarReceptor } from './spawnAvatarReceptor'

describe('moveAvatar function tests', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.store.defaultDispatchDelay = () => 0
    Engine.instance.physicsWorld = Physics.createWorld()
    Engine.instance.userId = 'userId' as UserId
    Engine.instance.peerID = 'peerID' as PeerID
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should apply world.fixedDelta @ 60 tick to avatar movement, consistent with physics simulation', () => {
    const engineState = getMutableState(EngineState)
    engineState.simulationTimestep.set(1000 / 60)

    dispatchAction(
      AvatarNetworkAction.spawn({
        $from: Engine.instance.userId,
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userId as string as EntityUUID
      })
    )

    applyIncomingActions()
    receiveActions(EntityNetworkState)

    spawnAvatarReceptor(Engine.instance.userId as string as EntityUUID)
    const entity = Engine.instance.getUserAvatarEntity(Engine.instance.userId)

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
    engineState.simulationTimestep.set(1000 / 60)

    dispatchAction(
      AvatarNetworkAction.spawn({
        $from: Engine.instance.userId,
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userId as string as EntityUUID
      })
    )

    applyIncomingActions()
    receiveActions(EntityNetworkState)

    spawnAvatarReceptor(Engine.instance.userId as string as EntityUUID)
    const entity = Engine.instance.getUserAvatarEntity(Engine.instance.userId)

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
    engineState.simulationTimestep.set(1000 / 60)

    /* mock */
    Engine.instance.physicsWorld.timestep = 1 / 2

    dispatchAction(
      AvatarNetworkAction.spawn({
        $from: Engine.instance.userId,
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userId as string as EntityUUID
      })
    )

    applyIncomingActions()
    receiveActions(EntityNetworkState)

    spawnAvatarReceptor(Engine.instance.userId as string as EntityUUID)
    const entity = Engine.instance.getUserAvatarEntity(Engine.instance.userId)

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
    engineState.simulationTimestep.set(1000 / 60)

    dispatchAction(
      AvatarNetworkAction.spawn({
        $from: Engine.instance.userId,
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userId as string as EntityUUID
      })
    )

    applyIncomingActions()
    receiveActions(EntityNetworkState)

    spawnAvatarReceptor(Engine.instance.userId as string as EntityUUID)
    const entity = Engine.instance.getUserAvatarEntity(Engine.instance.userId)

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
