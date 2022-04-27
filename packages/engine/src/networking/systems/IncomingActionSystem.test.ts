import assert, { strictEqual } from 'assert'
import matches from 'ts-matches'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import ActionFunctions, { ActionRecipients } from '@xrengine/hyperflux/functions/ActionFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { createEngine } from '../../initializeEngine'
import { NetworkWorldAction } from '../functions/NetworkWorldAction'

describe('IncomingActionSystem Unit Tests', async () => {
  describe('applyIncomingActions', () => {
    it('should delay incoming action from the future', () => {
      /* mock */
      createEngine()
      const world = Engine.instance.currentWorld

      // fixed tick in past
      world.fixedTick = 0

      const action = NetworkWorldAction.spawnObject({
        $from: '0' as UserId,
        prefab: '',
        parameters: {},
        // incoming action from future
        $time: 2,
        $to: '0' as ActionRecipients
      })

      world.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      ActionFunctions.addActionReceptor(world.store, (a) =>
        matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
      )

      /* run */
      ActionFunctions.applyIncomingActions(world.store)

      /* assert */
      strictEqual(recepted.length, 0)

      // fixed tick update
      world.fixedTick = 2
      ActionFunctions.applyIncomingActions(world.store)

      /* assert */
      strictEqual(recepted.length, 1)
    })

    it('should immediately apply incoming action from the past or present', () => {
      /* mock */
      createEngine()
      const world = Engine.instance.currentWorld

      const action = NetworkWorldAction.spawnObject({
        $from: '0' as UserId,
        prefab: '',
        parameters: {},
        // incoming action from past
        $time: -1,
        $to: '0' as ActionRecipients
      })

      world.store.actions.incoming.push(action)

      const recepted: typeof action[] = []
      ActionFunctions.addActionReceptor(world.store, (a) =>
        matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
      )

      /* run */
      ActionFunctions.applyIncomingActions(world.store)

      /* assert */
      strictEqual(recepted.length, 1)
    })
  })

  describe('applyAndArchiveIncomingAction', () => {
    it('should cache actions where $cache = true', () => {
      /* mock */
      createEngine()
      const world = Engine.instance.currentWorld

      const action = NetworkWorldAction.spawnObject({
        $from: '0' as UserId,
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
      ActionFunctions.applyIncomingActions(world.store)

      /* assert */
      strictEqual(recepted.length, 1)
      assert(world.store.actions.cached.indexOf(action) !== -1)
    })
  })
})
