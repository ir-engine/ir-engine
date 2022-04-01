import assert, { strictEqual } from 'assert'
import ActionFunctions, { ActionRecipients } from 'src/hyperflux/functions/ActionFunctions'
import matches from 'ts-matches'

import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { createWorld } from '../classes/World'

describe('IncomingNetworkSystem Unit Tests', async () => {
  describe('applyIncomingActions', () => {
    it('should delay incoming action from the future', () => {
      /* mock */
      const world = createWorld()

      // fixed tick in past
      world.fixedTick = 0

      const action = NetworkWorldAction.spawnObject({
        $from: '0' as UserId,
        ownerIndex: 0,
        prefab: '',
        parameters: {},
        // incoming action from future
        $tick: 1,
        $to: '0' as ActionRecipients
      })

      world.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      ActionFunctions.addActionReceptor((a) =>
        matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
      )

      /* run */
      ActionFunctions.applyIncomingActions(world)

      /* assert */
      strictEqual(recepted.length, 0)
    })

    it('should immediately apply incoming action from the past or present', () => {
      /* mock */
      const world = createWorld()

      // fixed tick in future
      world.fixedTick = 1

      const action = NetworkWorldAction.spawnObject({
        $from: '0' as UserId,
        ownerIndex: 0,
        prefab: '',
        parameters: {},
        // incoming action from past
        $tick: 0,
        $to: '0' as ActionRecipients
      })

      world.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      ActionFunctions.addActionReceptor((a) =>
        matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
      )

      /* run */
      ActionFunctions.applyIncomingActions(world)

      /* assert */
      strictEqual(recepted.length, 1)
    })
  })

  describe('applyAndArchiveIncomingAction', () => {
    it('should cache actions where $cache = true', () => {
      /* mock */
      const world = createWorld()

      // fixed tick in future
      world.fixedTick = 1

      const action = NetworkWorldAction.spawnObject({
        $from: '0' as UserId,
        ownerIndex: 0,
        prefab: '',
        parameters: {},
        // incoming action from past
        $tick: 0,
        $to: '0' as ActionRecipients,
        $cache: true
      })

      world.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      ActionFunctions.addActionReceptor((a) =>
        matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
      )

      /* run */
      ActionFunctions.applyIncomingActions(world)

      /* assert */
      strictEqual(recepted.length, 1)
      assert(world.store.actions.cached.indexOf(action) !== -1)
    })
  })
})
