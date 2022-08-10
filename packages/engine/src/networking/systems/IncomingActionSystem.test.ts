import assert, { strictEqual } from 'assert'
import matches from 'ts-matches'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { getState } from '@xrengine/hyperflux'
import ActionFunctions, { ActionRecipients } from '@xrengine/hyperflux/functions/ActionFunctions'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { createEngine } from '../../initializeEngine'
import { NetworkTopics } from '../classes/Network'
import { WorldNetworkAction } from '../functions/WorldNetworkAction'

describe('IncomingActionSystem Unit Tests', async () => {
  beforeEach(() => {
    createEngine()
    // this is hacky but works and preserves the logic
    Engine.instance.store.getDispatchTime = () => {
      return Engine.instance.currentWorld.fixedTick
    }
    createMockNetwork()
  })

  describe('applyIncomingActions', () => {
    it('should delay incoming action from the future', () => {
      const world = Engine.instance.currentWorld

      // fixed tick in past
      const engineState = getState(EngineState)
      engineState.fixedTick.set(0)

      /* mock */
      const action = WorldNetworkAction.spawnObject({
        $from: '0' as UserId,
        prefab: '',
        // incoming action from future
        $time: 2,
        $to: '0' as ActionRecipients
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      ActionFunctions.addActionReceptor((a) =>
        matches(a).when(WorldNetworkAction.spawnObject.matches, (a) => recepted.push(a))
      )

      /* run */
      ActionFunctions.applyIncomingActions()

      /* assert */
      strictEqual(recepted.length, 0)

      // fixed tick update
      engineState.fixedTick.set(2)
      ActionFunctions.applyIncomingActions()

      /* assert */
      strictEqual(recepted.length, 1)
    })

    it('should immediately apply incoming action from the past or present', () => {
      const world = Engine.instance.currentWorld

      /* mock */
      const action = WorldNetworkAction.spawnObject({
        $from: '0' as UserId,
        prefab: '',
        // incoming action from past
        $time: -1,
        $to: '0' as ActionRecipients
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      ActionFunctions.addActionReceptor((a) =>
        matches(a).when(WorldNetworkAction.spawnObject.matches, (a) => recepted.push(a))
      )

      /* run */
      ActionFunctions.applyIncomingActions()

      /* assert */
      strictEqual(recepted.length, 1)
    })
  })

  describe('applyAndArchiveIncomingAction', () => {
    it('should cache actions where $cache = true', () => {
      const world = Engine.instance.currentWorld

      /* mock */
      const action = WorldNetworkAction.spawnObject({
        $from: '0' as UserId,
        prefab: '',
        // incoming action from past
        $time: 0,
        $to: '0' as ActionRecipients,
        $cache: true
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      ActionFunctions.addActionReceptor((a) =>
        matches(a).when(WorldNetworkAction.spawnObject.matches, (a) => recepted.push(a))
      )

      /* run */
      ActionFunctions.applyIncomingActions()

      /* assert */
      strictEqual(recepted.length, 1)
      assert(Engine.instance.store.actions.cached.indexOf(action) !== -1)
    })
  })
})
