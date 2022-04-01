import assert from 'assert'

import { addActionReceptor, dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../src/ecs/classes/Engine'
import { createWorld } from '../../src/ecs/classes/World'
import { mockProgressWorldForNetworkActions } from './NetworkTestHelpers'

describe('NetworkTestHelpers', () => {
  it('mockProgressWorldForNetworkActions', () => {
    it('should take 2 ticks to dispatch', () => {
      const world = createWorld()
      Engine.currentWorld = world
      Engine.currentWorld.fixedTick = 0

      // @ts-ignore
      Engine.userId = 'server' as any
      const mockAction = () => {
        return {
          type: 'mock.ACTION'
        }
      }

      const mockActionResponse = {
        $from: 'server',
        $tick: 2,
        $to: 'local',
        type: 'mock.ACTION'
      }

      let actionResponse = null as any

      addActionReceptor(Engine.store, (action) => {
        actionResponse = action
      })

      dispatchAction(Engine.store, mockAction())
      mockProgressWorldForNetworkActions(world)
      assert.deepEqual(actionResponse, mockActionResponse)
    })
  })
})
