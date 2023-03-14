import assert, { strictEqual } from 'assert'
import matches from 'ts-matches'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { getMutableState } from '@etherealengine/hyperflux'
import {
  ActionRecipients,
  addActionReceptor,
  applyIncomingActions
} from '@etherealengine/hyperflux/functions/ActionFunctions'

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
      return Engine.instance.fixedTick
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
      addActionReceptor((a) => matches(a).when(WorldNetworkAction.spawnObject.matches, (a) => recepted.push(a)))

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(recepted.length, 0)

      // fixed tick update
      engineState.fixedTick.set(2)
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
        $to: '0' as ActionRecipients
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
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
        $cache: true
      })
      action.$topic = NetworkTopics.world

      Engine.instance.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      addActionReceptor((a) => matches(a).when(WorldNetworkAction.spawnObject.matches, (a) => recepted.push(a)))

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(recepted.length, 1)
      assert(Engine.instance.store.actions.cached.indexOf(action) !== -1)
    })
  })
})
