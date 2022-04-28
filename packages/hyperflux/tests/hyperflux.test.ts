import assert from 'assert'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { matches, matchesWithDefault } from '@xrengine/engine/src/common/functions/MatchesUtils'

import {
  addActionReceptor,
  applyIncomingActions,
  clearOutgoingActions,
  createHyperStore,
  defineAction,
  defineState,
  dispatchAction,
  getState,
  registerState,
  removeActionReceptor
} from '..'

describe('Hyperflux Unit Testss', () => {
  it('should be able to define and create an action', () => {
    // @ts-expect-error - should type error if missing store key
    const testMissingStore = defineAction({
      type: 'TEST_ACTION'
    })
    const test = defineAction({
      store: 'TEST',
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
      store: 'TEST',
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
      test.matches.unsafeCast({
        store: 'TEST',
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
      store: 'TEST',
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
      store: 'TEST',
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

  it('should be able to dispatch an action to a local store', () => {
    const wrongStore = createHyperStore({
      name: 'WRONG_STORE',
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const store = createHyperStore({ name: 'TEST_STORE', getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    const greet = defineAction({
      store: 'TEST_STORE',
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    // @ts-expect-error - should type error if providing wrong store
    assert.throws(() => dispatchAction(wrongStore, greet({})))
    dispatchAction(store, greet({}))
    assert.equal(store.actions.incoming.length, 1)
    assert.equal(store.actions.outgoing.length, 0)
    assert(greet.matches.test(store.actions.incoming[0]))
    assert(store.actions.incoming[0].$from == 'id')
    assert(store.actions.incoming[0].$to == 'all')
    assert(store.actions.incoming[0].$time <= Date.now())
    assert(store.actions.incoming[0].$cache === false)
    applyIncomingActions(store)
    assert.equal(store.actions.incomingHistory.length, 1)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing.length, 0)
    clearOutgoingActions(store)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing.length, 0)
  })

  it('should be able to dispatch an action to a peer store', () => {
    const store = createHyperStore({
      name: 'TEST_STORE',
      getDispatchMode: () => 'peer',
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      store: 'TEST_STORE',
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    dispatchAction(store, greet({}))
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing.length, 1)
    assert(greet.matches.test(store.actions.outgoing[0]))
    assert(store.actions.outgoing[0].$from == 'id')
    assert(store.actions.outgoing[0].$to == 'all')
    assert(store.actions.outgoing[0].$time <= Date.now())
    assert(store.actions.outgoing[0].$cache === false)
    applyIncomingActions(store)
    assert.equal(store.actions.incomingHistory.length, 0)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing.length, 1)
    assert.equal(store.actions.outgoingHistory.length, 0)
    clearOutgoingActions(store)
    assert.equal(store.actions.incomingHistory.length, 0)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing.length, 0)
    assert.equal(store.actions.outgoingHistory.length, 1)
  })

  it('should be able to dispatch an action to a host store', () => {
    const store = createHyperStore({
      name: 'TEST_STORE',
      getDispatchMode: () => 'host',
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      store: 'TEST_STORE',
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    dispatchAction(store, greet({}))
    assert(greet.matches.test(store.actions.incoming[0]))
    assert.equal(store.actions.incoming.length, 1)
    assert(store.actions.incoming[0].$from == 'id')
    assert(store.actions.incoming[0].$to == 'all')
    assert(store.actions.incoming[0].$time <= Date.now())
    assert(store.actions.incoming[0].$cache === false)
    applyIncomingActions(store)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing.length, 1)
    clearOutgoingActions(store)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing.length, 0)
  })

  it('should be able to dispatch an action to a peer store', () => {
    const store = createHyperStore({
      name: 'TEST_STORE',
      getDispatchMode: () => 'peer',
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      store: 'TEST_STORE',
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
      store: 'TEST_STORE',
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    let receivedCount = 0
    const receptor = (action) => {
      assert(greet.matches.test(action))
      receivedCount++
    }
    addActionReceptor(store, receptor)
    dispatchAction(store, greet({}))
    applyIncomingActions(store)
    assert.equal(receivedCount, 1)

    const action = greet({})
    dispatchAction(store, action)
    applyIncomingActions(store)
    assert.equal(receivedCount, 2)
    // ensure that the same action is not applied twice
    dispatchAction(store, action)
    applyIncomingActions(store)
    assert.equal(receivedCount, 2)
  })

  it('should add incoming actions to cache as indicated', () => {
    const store = createHyperStore({ name: 'TEST_STORE', getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    const greet = defineAction({
      store: 'TEST_STORE',
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })

    let receivedCount = 0
    const receptor = (action) => {
      assert(greet.matches.test(action))
      receivedCount++
    }

    addActionReceptor(store, receptor)

    dispatchAction(store, greet({ $cache: true }))
    dispatchAction(store, greet({ $cache: false }))
    dispatchAction(store, greet({ $cache: true }))
    dispatchAction(store, greet({ $cache: true }))
    dispatchAction(store, greet({ $cache: true }))
    applyIncomingActions(store)

    assert.equal(receivedCount, 5)
    assert.equal(store.actions.cached.length, 4)

    dispatchAction(store, greet({ $cache: { removePrevious: true } }))
    applyIncomingActions(store)
    assert.equal(receivedCount, 6)
    assert.equal(store.actions.cached.length, 1)

    dispatchAction(store, greet({ $cache: true }))
    dispatchAction(store, greet({ $cache: true }))
    dispatchAction(store, greet({ $cache: true }))
    dispatchAction(store, greet({ greeting: 'welcome', $cache: true }))
    applyIncomingActions(store)
    assert.equal(receivedCount, 10)
    assert.equal(store.actions.cached.length, 5)
    assert.equal(store.actions.incomingHistory.at(-1)!['greeting'], 'welcome')

    dispatchAction(store, greet({ greeting: 'welcome', $cache: { removePrevious: ['greeting'], disable: true } }))
    applyIncomingActions(store)
    assert.equal(receivedCount, 11)
    assert.equal(store.actions.cached.length, 4)
    assert.equal(store.actions.incomingHistory.at(-1)!['greeting'], 'welcome')

    dispatchAction(store, greet({ $from: 'differentUser' as UserId, $cache: { removePrevious: true } }))
    applyIncomingActions(store)
    assert.equal(receivedCount, 12)
    assert.equal(store.actions.cached.length, 5)

    dispatchAction(store, greet({ $cache: { removePrevious: true, disable: true } }))
    applyIncomingActions(store)
    assert.equal(receivedCount, 13)
    assert.equal(store.actions.cached.length, 1)

    dispatchAction(store, greet({ $from: 'differentUser' as UserId, $cache: { removePrevious: true, disable: true } }))
    applyIncomingActions(store)
    assert.equal(receivedCount, 14)
    assert.equal(store.actions.cached.length, 0)
  })

  it('should be able to apply incoming actions to receptors in a peer store', () => {
    const store = createHyperStore({
      name: 'TEST_STORE',
      getDispatchMode: () => 'peer',
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      store: 'TEST_STORE',
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
    store.actions.incoming.push(...store.actions.outgoing)
    clearOutgoingActions(store)
    assert(store.actions.outgoing.length === 0)
    assert(greet.matches.test(store.actions.incoming[0]))
    applyIncomingActions(store)
    assert(receivedAction)
  })

  it('should be able to apply multiple actions at once to a peer store', () => {
    const store = createHyperStore({
      name: 'TEST_STORE',
      getDispatchMode: () => 'peer',
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      store: 'TEST_STORE',
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    let receivedCount = 0
    const receptor = (action) => {
      assert(greet.matches.test(action))
      receivedCount++
    }
    addActionReceptor(store, receptor)
    dispatchAction(store, greet({}))
    dispatchAction(store, greet({}))
    dispatchAction(store, greet({}))
    dispatchAction(store, greet({}))
    assert.equal(receivedCount, 0)
    assert.equal(store.actions.outgoing.length, 4)
    clearOutgoingActions(store)
    assert.equal(receivedCount, 0)
    assert.equal(store.actions.outgoingHistory.length, 4)
    store.actions.incoming.push(...store.actions.outgoingHistory)
    assert.equal(store.actions.incoming.length, 4)
    applyIncomingActions(store)
    assert.equal(receivedCount, 4)
    assert.equal(store.actions.incomingHistory.length, 4)
    assert.equal(store.actions.incomingHistoryUUIDs.size, 4)
    store.actions.incoming.push(...store.actions.outgoingHistory)
    applyIncomingActions(store)
    assert.equal(receivedCount, 4)
    assert.equal(store.actions.incomingHistory.length, 4)
    assert.equal(store.actions.incomingHistoryUUIDs.size, 4)
  })

  it('should be able to apply multiple actions at once to a host store', () => {
    const store = createHyperStore({
      name: 'TEST_STORE',
      getDispatchMode: () => 'host',
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      store: 'TEST_STORE',
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    let receivedCount = 0
    const receptor = (action) => {
      assert(greet.matches.test(action))
      receivedCount++
    }
    addActionReceptor(store, receptor)
    dispatchAction(store, greet({}))
    dispatchAction(store, greet({}))
    dispatchAction(store, greet({}))
    dispatchAction(store, greet({}))
    assert.equal(receivedCount, 0)
    assert.equal(store.actions.incoming.length, 4)
    assert.equal(store.actions.outgoing.length, 0)
    clearOutgoingActions(store)
    assert.equal(receivedCount, 0)
    assert.equal(store.actions.outgoing.length, 0)
    assert.equal(store.actions.outgoingHistory.length, 0)
    assert.equal(store.actions.incoming.length, 4)
    assert.equal(store.actions.incomingHistory.length, 0)
    applyIncomingActions(store)
    assert.equal(receivedCount, 4)
    assert.equal(store.actions.incomingHistory.length, 4)
    assert.equal(store.actions.incomingHistoryUUIDs.size, 4)
    assert.equal(store.actions.outgoing.length, 4)
    assert.equal(store.actions.outgoingHistory.length, 0)
    clearOutgoingActions(store)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing.length, 0)
    assert.equal(store.actions.incomingHistory.length, 4)
    assert.equal(store.actions.incomingHistoryUUIDs.size, 4)
    assert.equal(store.actions.outgoingHistory.length, 4)
    assert.equal(store.actions.outgoingHistoryUUIDs.size, 4)
    assert.equal(store.actions.incomingHistory[1], store.actions.outgoingHistory[1])
    assert.equal(store.actions.incomingHistory[2], store.actions.outgoingHistory[2])
    assert.equal(store.actions.incomingHistory[3], store.actions.outgoingHistory[3])
    assert.equal(store.actions.incomingHistory[4], store.actions.outgoingHistory[4])
    assert.equal(receivedCount, 4)
    store.actions.incoming.push(...store.actions.outgoingHistory)
    applyIncomingActions(store)
    assert.equal(receivedCount, 4)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing.length, 0)
    assert.equal(store.actions.incomingHistory.length, 4)
    assert.equal(store.actions.incomingHistoryUUIDs.size, 4)
    assert.equal(store.actions.outgoingHistory.length, 4)
    assert.equal(store.actions.outgoingHistoryUUIDs.size, 4)
  })

  it('should be able to define state and register it to a store', () => {
    const HospitalityState = defineState({
      store: 'TEST_STORE',
      name: 'hospitality',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })
    const store = createHyperStore({ name: 'TEST_STORE', getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    registerState(store, HospitalityState)
    assert(store.state.hospitality)
  })

  it('should be able to get immutable registered state', () => {
    const HospitalityState = defineState({
      store: 'TEST_STORE',
      name: 'hospitality',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })
    const store = createHyperStore({ name: 'TEST_STORE', getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    registerState(store, HospitalityState)
    assert(store.state.hospitality)
    const hospitality = getState(store, HospitalityState).value
    assert.equal(hospitality.greetingCount, 0)
  })

  it('should be able to mutate registered state inside a receptor', () => {
    const HospitalityState = defineState({
      store: 'TEST_STORE',
      name: 'hospitality',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })

    const greet = defineAction({
      store: 'TEST_STORE',
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })

    const store = createHyperStore({ name: 'TEST_STORE', getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    registerState(store, HospitalityState)
    assert(store.state.hospitality)

    addActionReceptor(store, (action) => {
      matches(action).when(greet.matches, () => {})
      const hospitality = getState(store, HospitalityState)
      hospitality.greetingCount.set(100)
    })

    dispatchAction(store, greet({}))
    applyIncomingActions(store)
    assert.equal(getState(store, HospitalityState).greetingCount.value, 100)
  })
})
