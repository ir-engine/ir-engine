import { createEngine, Engine, useEngine } from "../../src/ecs/classes/Engine"
import { createWorld } from "../../src/ecs/classes/World"
import { dispatchFrom } from "../../src/networking/functions/dispatchFrom"
import assert from 'assert'
import { TestNetwork } from "./TestNetwork"
import { Network } from "../../src/networking/classes/Network"
import { mockProgressWorldForNetworkActions } from "./NetworkTestHelpers"

describe('NetworkTestHelpers', () => {
  describe('mockProgressWorldForNetworkActions', () => {

    after(() => {
      useEngine().currentWorld = null!
      useEngine().defaultWorld = null!
      Engine.instance = null!
    })
  
    before(() => {
      createEngine()
      Network.instance = new TestNetwork()
      const world = createWorld()
      useEngine().currentWorld = world
      useEngine().currentWorld!.fixedTick = 0
    })

    it('should take 2 ticks to dispatch', () => {
      useEngine().userId = 'server' as any
      const mockAction = () => { 
        return {
          type: 'mock.ACTION',
        }
      }

      const mockActionResponse = {
        '$from': 'server',
        '$tick': 2,
        '$to': 'local',
        type: 'mock.ACTION'
      }

      let actionResponse = null as any

      useEngine().currentWorld?.receptors.push((action) => {
        actionResponse = action
      })

      dispatchFrom(useEngine().userId as any, mockAction).to('local')   
      mockProgressWorldForNetworkActions() 
      assert.deepEqual(actionResponse, mockActionResponse)
    })
  })
})