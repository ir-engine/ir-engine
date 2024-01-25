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
import { applyIncomingActions, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { AvatarID, UserID } from '@etherealengine/common/src/schema.type.module'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { EventDispatcher } from '../../common/classes/EventDispatcher'
import { Engine, destroyEngine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { SystemDefinitions } from '../../ecs/functions/SystemFunctions'
import { createEngine } from '../../initializeEngine'
import { EntityNetworkStateSystem } from '../../networking/NetworkModule'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { applyGamepadInput } from './moveAvatar'
import { spawnAvatarReceptor } from './spawnAvatarReceptor'

import { act, render } from '@testing-library/react'
import React from 'react'
import { AvatarComponent } from '../components/AvatarComponent'

describe('moveAvatar function tests', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.store.defaultDispatchDelay = () => 0
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
    Engine.instance.userID = 'userId' as UserID
    loadEmptyScene()

    const eventDispatcher = new EventDispatcher()
    ;(Engine.instance.api as any) = {
      service: () => {
        return {
          on: (serviceName, cb) => {
            eventDispatcher.addEventListener(serviceName, cb)
          },
          off: (serviceName, cb) => {
            eventDispatcher.removeEventListener(serviceName, cb)
          }
        }
      }
    }
  })

  const Reactor = SystemDefinitions.get(EntityNetworkStateSystem)!.reactor!
  const tag = <Reactor />

  afterEach(() => {
    return destroyEngine()
  })

  it('should apply world.fixedDelta @ 60 tick to avatar movement, consistent with physics simulation', async () => {
    const engineState = getMutableState(EngineState)
    engineState.simulationTimestep.set(1000 / 60)

    dispatchAction(
      AvatarNetworkAction.spawn({
        $from: Engine.instance.userID,
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userID as string as EntityUUID,
        avatarID: '' as AvatarID
      })
    )

    applyIncomingActions()

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)
    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity
    const avatar = getComponent(entity, AvatarControllerComponent)

    avatar.gamepadWorldMovement.setZ(-1)

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    /* assert */
    unmount()
  })

  it('should apply world.fixedDelta @ 120 tick to avatar movement, consistent with physics simulation', async () => {
    const engineState = getMutableState(EngineState)
    engineState.simulationTimestep.set(1000 / 60)

    dispatchAction(
      AvatarNetworkAction.spawn({
        $from: Engine.instance.userID,
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userID as string as EntityUUID,
        avatarID: '' as AvatarID
      })
    )

    applyIncomingActions()

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)
    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    /* assert */
    unmount()
  })

  it('should take world.physics.timeScale into account when moving avatars, consistent with physics simulation', async () => {
    Engine.instance.userID = 'user' as UserID

    const engineState = getMutableState(EngineState)
    engineState.simulationTimestep.set(1000 / 60)

    /* mock */
    getState(PhysicsState).physicsWorld.timestep = 1 / 2

    dispatchAction(
      AvatarNetworkAction.spawn({
        $from: Engine.instance.userID,
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userID as string as EntityUUID,
        avatarID: '' as AvatarID
      })
    )

    applyIncomingActions()

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)
    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    /* assert */
    unmount()
  })

  it('should not allow velocity to breach a full unit through multiple frames', async () => {
    Engine.instance.userID = 'user' as UserID

    const engineState = getMutableState(EngineState)
    engineState.simulationTimestep.set(1000 / 60)

    dispatchAction(
      AvatarNetworkAction.spawn({
        $from: Engine.instance.userID,
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userID as string as EntityUUID,
        avatarID: '' as AvatarID
      })
    )

    applyIncomingActions()

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)
    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)
    const physicsWorld = getState(PhysicsState).physicsWorld
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)

    /* assert */
    unmount()
  })
})
