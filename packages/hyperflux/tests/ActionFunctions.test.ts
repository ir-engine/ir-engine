import { defineAction, matches } from '../'

describe('Hyperflux Action Unit Testss', () => {
  it('should be able to define an action with type', () => {
    const testAction = defineAction({
      type: 'TEST_ACTION'
    })
  })

  it('should be able to define an action with pattern matching', () => {})
})
