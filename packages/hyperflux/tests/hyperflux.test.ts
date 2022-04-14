import assert from 'assert'

import {
  addActionReceptor,
  applyIncomingActions,
  clearOutgoingActions,
  createHyperStore,
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  registerState,
  removeActionReceptor
} from '..'
import { matches, matchesWithDefault } from '../utils/MatchesUtils'

describe('Hyperflux Unit Testss', () => {
  it('should be able to define and create an action', () => {
    const test = defineAction({
      type: 'TEST_ACTION'
    })
    // @ts-expect-error - should type error if providing unknown fields, but should pass pattern matching
    assert(test.matches.test(test({ unknown: true })))
    const action = test({})
    assert.equal(action.type, 'TEST_ACTION')
    assert(test.matches.test(action))
    assert(test.resolvedActionShape.type.test('TEST_ACTION'))
    assert(test.matches.test({ type: 'FAIL' }) === false)
  })

  it('should be able to define and create actions with pattern matching', () => {
    const test = defineAction({
      type: 'TEST_PATTERN_MATCHING',
      payload: matches.string,
      optionalThing: matches.number.optional()
    })
    // @ts-expect-error - should type error if missing required fields, and should throw error
    assert.throws(() => test({}))
    // @ts-expect-error - should type error if providing wrong type, and should throw error
    assert.throws(() => test({ payload: 100 }))
    const action = test({ payload: 'abcd', $cache: false })
    assert.equal(action.type, 'TEST_PATTERN_MATCHING')
    assert.equal(action.optionalThing, null)
    assert(action.$cache === false)
    assert(test.matches.test(action))
    assert(
      test.matches.test({
        type: 'TEST_PATTERN_MATCHING',
        payload: 'efgh',
        optionalThing: 123
      })
    )
    assert(test.actionShape.payload.test('efg'))
    assert(test.actionShape.optionalThing.test(2))
  })

  it('should be able to define and create actions with action options', () => {
    const test = defineAction({
      type: 'TEST_OPTIONS',
      $cache: true
    })
    const action = test({ $cache: true })
    assert(action.type === 'TEST_OPTIONS')
    assert(test.matches.test(action))
    assert(test.resolvedActionShape.$cache.test(true))
    assert(test.resolvedActionShape.$cache.test(false) === false)
    assert(
      test.matches.test({
        type: 'TEST',
        $cache: false
      }) === false
    )
  })

  it('should be able to define and create actions with default values', () => {
    let count = 0
    const test = defineAction({
      type: 'TEST_DEFAULT_VALUES',
      count: matchesWithDefault(matches.number, () => count++),
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    assert.equal(test({}).count, 0)
    assert.equal(test({}).count, 1)
    assert.equal(test({}).count, 2)
    assert.equal(test({}).count, 3)
    const action = test({})
    assert.equal(action.count, 4)
    assert.equal(action.greeting, 'hi')
    const action2 = test({ greeting: 'hello' })
    assert.equal(action2.count, 5)
    assert.equal(action2.greeting, 'hello')
    assert(test.matches.test(action2))
  })

  it('should be able to dispatch an action to a store', () => {
    const store = createHyperStore({ name: 'TEST_STORE', getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    dispatchAction(store, greet({}))
    assert(greet.matches.test(store.actions.incoming[0]))
    assert(store.actions.incoming[0].$from == 'id')
    assert(store.actions.incoming[0].$to == 'all')
    assert(store.actions.incoming[0].$time <= Date.now())
    assert(store.actions.incoming[0].$cache === false)
  })

  it('should be able to dispatch an action to a networked store', () => {
    const store = createHyperStore({
      name: 'TEST_STORE',
      networked: true,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    dispatchAction(store, greet({}))
    assert(greet.matches.test(store.actions.outgoing[0]))
    assert(store.actions.outgoing[0].$from == 'id')
    assert(store.actions.outgoing[0].$to == 'all')
    assert(store.actions.outgoing[0].$time <= Date.now())
    assert(store.actions.outgoing[0].$cache === false)
  })

  it('should be able to add and remove action receptors in a store', () => {
    const store = createHyperStore({
      name: 'TEST_STORE',
      networked: true,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const receptor = () => {}
    addActionReceptor(store, receptor)
    assert.equal(store.receptors[0], receptor)
    removeActionReceptor(store, receptor)
    assert.equal(store.receptors.length, 0)
  })

  it('should be able to apply incoming actions to receptors in a local store', () => {
    const store = createHyperStore({ name: 'TEST_STORE', getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    let receivedAction = false
    const receptor = (action) => {
      assert(greet.matches.test(action))
      receivedAction = true
    }
    addActionReceptor(store, receptor)
    dispatchAction(store, greet({}))
    applyIncomingActions(store)
    assert(receivedAction)
  })

  it('should be able to apply incoming actions to receptors in a networked store', () => {
    const store = createHyperStore({
      name: 'TEST_STORE',
      networked: true,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    let receivedAction = false
    const receptor = (action) => {
      assert(greet.matches.test(action))
      receivedAction = true
    }
    addActionReceptor(store, receptor)
    dispatchAction(store, greet({}))
    assert(greet.matches.test(store.actions.outgoing[0]))
    clearOutgoingActions(store, true)
    assert(store.actions.outgoing.length === 0)
    assert(greet.matches.test(store.actions.incoming[0]))
    applyIncomingActions(store)
    assert(receivedAction)
  })

  it('should be able to define state and register it to a store', () => {
    const HospitalityState = defineState('hospitality', () => ({
      greetingCount: 0,
      lastGreeting: null as string | null
    }))
    const store = createHyperStore({ name: 'TEST_STORE', getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    registerState(store, HospitalityState)
    assert(store.state.hospitality)
  })

  it('should be able to get immutable registered state', () => {
    const HospitalityState = defineState('hospitality', () => ({
      greetingCount: 0,
      lastGreeting: null as string | null
    }))
    const store = createHyperStore({ name: 'TEST_STORE', getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    registerState(store, HospitalityState)
    assert(store.state.hospitality)
    const hospitality = getState(store, HospitalityState)
    assert.equal(hospitality.greetingCount, 0)
    assert.throws(() => getMutableState(store, HospitalityState))
    assert.equal(getMutableState(store, HospitalityState, true).greetingCount.value, 0)
  })

  it('should be able to mutate registered state inside a receptor', () => {
    const HospitalityState = defineState('hospitality', () => ({
      greetingCount: 0,
      lastGreeting: null as string | null
    }))

    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })

    const store = createHyperStore({ name: 'TEST_STORE', getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    registerState(store, HospitalityState)
    assert(store.state.hospitality)

    addActionReceptor(store, (action) => {
      matches(action).when(greet.matches, () => {})
      const hospitality = getMutableState(store, HospitalityState)
      hospitality.greetingCount.set(100)
    })

    dispatchAction(store, greet({}))
    applyIncomingActions(store)
    assert.equal(getState(store, HospitalityState).greetingCount, 100)
  })
})
