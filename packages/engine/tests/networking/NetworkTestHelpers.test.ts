import { Engine } from '../../src/ecs/classes/Engine'
import { createWorld } from '../../src/ecs/classes/World'
import { dispatchFrom } from '../../src/networking/functions/dispatchFrom'
import assert from 'assert'
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

      Engine.currentWorld?.receptors.push((action) => {
        actionResponse = action
      })

      dispatchFrom(Engine.userId as any, mockAction).to('local')
      mockProgressWorldForNetworkActions(world)
      assert.deepEqual(actionResponse, mockActionResponse)
    })
  })
})
