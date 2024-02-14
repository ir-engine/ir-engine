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
import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine, destroyEngine } from '@etherealengine/ecs/src/Engine'
import { EventDispatcher } from '@etherealengine/spatial/src/common/classes/EventDispatcher'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { applyGamepadInput } from './moveAvatar'
import { spawnAvatarReceptor } from './spawnAvatarReceptor'

import '@etherealengine/spatial/src/networking/state/EntityNetworkState'

import { SystemDefinitions } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { NetworkState } from '@etherealengine/spatial/src/networking/NetworkState'
import { NetworkWorldUserStateSystem } from '@etherealengine/spatial/src/networking/NetworkUserState'
import { Network } from '@etherealengine/spatial/src/networking/classes/Network'
import { NetworkPeerFunctions } from '@etherealengine/spatial/src/networking/functions/NetworkPeerFunctions'
import { createMockNetwork } from '@etherealengine/spatial/tests/util/createMockNetwork'
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
    createMockNetwork()

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

  afterEach(() => {
    return destroyEngine()
  })

  const NetworkWorldUserStateSystemReactor = SystemDefinitions.get(NetworkWorldUserStateSystem)!.reactor!
  const tag = <NetworkWorldUserStateSystemReactor />

  it('should apply world.fixedDelta @ 60 tick to avatar movement, consistent with physics simulation', async () => {
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const network = NetworkState.worldNetwork as Network
    NetworkPeerFunctions.createPeer(network, Engine.instance.peerID, 0, Engine.instance.userID, 0, 'user name')

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

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

    unmount()
  })

  it('should apply world.fixedDelta @ 120 tick to avatar movement, consistent with physics simulation', async () => {
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const network = NetworkState.worldNetwork as Network
    NetworkPeerFunctions.createPeer(network, Engine.instance.peerID, 0, Engine.instance.userID, 0, 'user name')

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

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

    spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)
    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    unmount()
  })

  it('should take world.physics.timeScale into account when moving avatars, consistent with physics simulation', async () => {
    Engine.instance.userID = 'user' as UserID

    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const network = NetworkState.worldNetwork as Network
    NetworkPeerFunctions.createPeer(network, Engine.instance.peerID, 0, Engine.instance.userID, 0, 'user name')

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

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

    spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)
    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    unmount()
  })

  it('should not allow velocity to breach a full unit through multiple frames', async () => {
    Engine.instance.userID = 'user' as UserID

    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const network = NetworkState.worldNetwork as Network
    NetworkPeerFunctions.createPeer(network, Engine.instance.peerID, 0, Engine.instance.userID, 0, 'user name')

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

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

    unmount()
  })
})
