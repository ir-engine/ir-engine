import assert, { strictEqual } from 'assert'
import matches from 'ts-matches'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import ActionFunctions, { ActionRecipients } from '@xrengine/hyperflux/functions/ActionFunctions'

import { createWorld } from '../../ecs/classes/World'
import { NetworkWorldAction } from '../functions/NetworkWorldAction'

describe('IncomingActionSystem Unit Tests', async () => {
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
        $time: Date.now() + 16,
        $to: '0' as ActionRecipients
      })

      world.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      ActionFunctions.addActionReceptor(world.store, (a) =>
        matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
      )

      /* run */
      ActionFunctions.applyIncomingActions(world.store, Date.now())

      /* assert */
      strictEqual(recepted.length, 0)
    })

    it('should immediately apply incoming action from the past or present', () => {
      /* mock */
      const world = createWorld()

      const action = NetworkWorldAction.spawnObject({
        $from: '0' as UserId,
        ownerIndex: 0,
        prefab: '',
        parameters: {},
        // incoming action from past
        $time: Date.now() - 100,
        $to: '0' as ActionRecipients
      })

      world.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      ActionFunctions.addActionReceptor(world.store, (a) =>
        matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
      )

      /* run */
      ActionFunctions.applyIncomingActions(world.store, Date.now())

      /* assert */
      strictEqual(recepted.length, 1)
    })
  })

  describe('applyAndArchiveIncomingAction', () => {
    it('should cache actions where $cache = true', () => {
      /* mock */
      const world = createWorld()

      const action = NetworkWorldAction.spawnObject({
        $from: '0' as UserId,
        ownerIndex: 0,
        prefab: '',
        parameters: {},
        // incoming action from past
        $time: 0,
        $to: '0' as ActionRecipients,
        $cache: true
      })

      world.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      ActionFunctions.addActionReceptor(world.store, (a) =>
        matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
      )

      /* run */
      ActionFunctions.applyIncomingActions(world.store, Date.now())

      /* assert */
      strictEqual(recepted.length, 1)
      assert(world.store.actions.cached.indexOf(action) !== -1)
    })
  })
})
