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
import matches from 'ts-matches'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import {
  ActionRecipients,
  addActionReceptor,
  applyIncomingActions,
  getMutableState,
  getState
} from '@etherealengine/hyperflux'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { createEngine } from '../../initializeEngine'
import { NetworkTopics } from '../classes/Network'
import { WorldNetworkAction } from '../functions/WorldNetworkAction'

describe('IncomingActionSystem Unit Tests', async () => {
  beforeEach(() => {
    createEngine()
    // this is hacky but works and preserves the logic
    Engine.instance.store.getDispatchTime = () => {
      return getState(EngineState).simulationTime
    }
    createMockNetwork()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('applyIncomingActions', () => {
    it('should delay incoming action from the future', () => {
      // fixed tick in past
      const engineState = getMutableState(EngineState)
      engineState.simulationTime.set(0)

      /* mock */
      const action = WorldNetworkAction.spawnObject({
        $from: '0' as UserId,
        prefab: '',
        // incoming action from future
        $time: 2,
        $to: '0' as ActionRecipients,
        entityUUID: '0' as EntityUUID
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      const recepted: (typeof action)[] = []
      addActionReceptor((a) => matches(a).when(WorldNetworkAction.spawnObject.matches, (a) => recepted.push(a)))

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(recepted.length, 0)

      // fixed tick update
      engineState.simulationTime.set(2)
      applyIncomingActions()

      /* assert */
      strictEqual(recepted.length, 1)
    })

    it('should immediately apply incoming action from the past or present', () => {
      /* mock */
      const action = WorldNetworkAction.spawnObject({
        $from: '0' as UserId,
        prefab: '',
        // incoming action from past
        $time: -1,
        $to: '0' as ActionRecipients,
        entityUUID: '0' as EntityUUID
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      const recepted: (typeof action)[] = []
      addActionReceptor((a) => matches(a).when(WorldNetworkAction.spawnObject.matches, (a) => recepted.push(a)))

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(recepted.length, 1)
    })
  })

  describe('applyAndArchiveIncomingAction', () => {
    it('should cache actions where $cache = true', () => {
      /* mock */
      const action = WorldNetworkAction.spawnObject({
        $from: '0' as UserId,
        prefab: '',
        // incoming action from past
        $time: 0,
        $to: '0' as ActionRecipients,
        $cache: true,
        entityUUID: '0' as EntityUUID
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      const recepted: (typeof action)[] = []
      addActionReceptor((a) => matches(a).when(WorldNetworkAction.spawnObject.matches, (a) => recepted.push(a)))

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(recepted.length, 1)
      assert(Engine.instance.store.actions.cached.indexOf(action) !== -1)
    })
  })
})
