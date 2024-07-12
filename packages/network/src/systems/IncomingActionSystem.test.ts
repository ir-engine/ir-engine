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

import assert, { strictEqual } from 'assert'

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { EntityUUID, getComponent, UUIDComponent } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { createEngine, destroyEngine, Engine } from '@etherealengine/ecs/src/Engine'
import { ActionRecipients, applyIncomingActions, getMutableState, getState } from '@etherealengine/hyperflux'
import { initializeSpatialEngine } from '@etherealengine/spatial/src/initializeEngine'
import { SpawnObjectActions } from '@etherealengine/spatial/src/transform/SpawnObjectActions'

import { createMockNetwork } from '../../tests/createMockNetwork'
import { NetworkTopics } from '../Network'

describe('IncomingActionSystem Unit Tests', async () => {
  beforeEach(() => {
    createEngine()
    // this is hacky but works and preserves the logic
    Engine.instance.store.getDispatchTime = () => {
      return getState(ECSState).simulationTime
    }
    createMockNetwork()
    initializeSpatialEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('applyIncomingActions', () => {
    it('should delay incoming action from the future', () => {
      // fixed tick in past
      const ecsState = getMutableState(ECSState)
      ecsState.simulationTime.set(0)

      /* mock */
      const action = SpawnObjectActions.spawnObject({
        parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
        ownerID: '0' as UserID,
        // incoming action from future
        $time: 2,
        $to: '0' as ActionRecipients,
        entityUUID: '0' as EntityUUID
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 0)

      // fixed tick update
      ecsState.simulationTime.set(2)
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 1)
    })

    it('should immediately apply incoming action from the past or present', () => {
      /* mock */
      const action = SpawnObjectActions.spawnObject({
        parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
        ownerID: '0' as UserID,
        // incoming action from past
        $time: -1,
        $to: '0' as ActionRecipients,
        entityUUID: '0' as EntityUUID
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 1)
    })
  })

  describe('applyAndArchiveIncomingAction', () => {
    it('should cache actions where $cache = true', () => {
      /* mock */
      const action = SpawnObjectActions.spawnObject({
        parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
        ownerID: '0' as UserID,
        // incoming action from past
        $time: 0,
        $to: '0' as ActionRecipients,
        $cache: true,
        entityUUID: '0' as EntityUUID
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 1)
      assert(Engine.instance.store.actions.cached.indexOf(action) !== -1)
    })
  })
})
