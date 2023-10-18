import { StateDefinitions } from '@etherealengine/hyperflux'

import assert from 'assert'
import { BehaveGraphState } from '../../../../state/BehaveGraphState'
import { getStateGetters, getStateSetters } from './stateHelper'

const skipState = [BehaveGraphState.name]

describe('stateHelper', () => {
  describe('getStateSetters', () => {
    it('should return an array of NodeDefinition objects', () => {
      const setters = getStateSetters()
      assert(Array.isArray(setters))
      assert(setters.every((node) => typeof node === 'object'))
    })

    it('should skip states in the skipState array', () => {
      const skippedState = ''
      const setters = getStateSetters()
      assert(!setters.some((node) => node.typeName === `engine/state/set${skippedState}`))
    })

    it('should generate a NodeDefinition for each state in StateDefinitions', () => {
      const stateNames = Array.from(StateDefinitions.keys())
      const setters = getStateSetters()
      console.log(stateNames, setters)
      assert.strictEqual(setters.length, stateNames.length - skipState.length)
      assert(
        stateNames.every((stateName) => {
          if (skipState.includes(stateName)) {
            return true
          }
          return setters.some((node) => node.typeName === `engine/state/set${stateName}`)
        })
      )
    })
  })

  describe('getStateGetters', () => {
    it('should return an array of NodeDefinition objects', () => {
      const getters = getStateGetters()
      assert(Array.isArray(getters))
      assert(getters.every((node) => typeof node === 'object'))
    })

    it('should skip states in the skipState array', () => {
      const skippedState = ''
      const getters = getStateGetters()
      assert(!getters.some((node) => node.typeName === `engine/state/get${skippedState}`))
    })

    it('should generate a NodeDefinition for each state in StateDefinitions', () => {
      const stateNames = Array.from(StateDefinitions.keys())
      const getters = getStateGetters()
      assert.strictEqual(getters.length, stateNames.length - skipState.length)
      assert(
        stateNames.every((stateName) => {
          if (skipState.includes(stateName)) {
            return true
          }
          return getters.some((node) => node.typeName === `engine/state/get${stateName}`)
        })
      )
    })
  })
})
