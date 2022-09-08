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
  removeActionReceptor
} from '..'
import StateFunctions from '../functions/StateFunctions'

describe('Hyperflux Unit Tests', () => {
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
      test.matches.unsafeCast({
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
    assert(test.matches.test({ type: 'TEST' }) === false)
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

  it('should be able to dispatch an action to a local store', () => {
    const store = createHyperStore({
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    dispatchAction(greet({}), store)
    assert.equal(store.actions.incoming.length, 1)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    assert(greet.matches.test(store.actions.incoming[0]))
    assert(store.actions.incoming[0].$from == 'id')
    assert(store.actions.incoming[0].$to == 'all')
    assert(store.actions.incoming[0].$time <= Date.now())
    assert(store.actions.incoming[0].$cache === false)
    applyIncomingActions(store)
    assert.equal(store.actions.history.length, 1)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    clearOutgoingActions(store.defaultTopic, store)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
  })

  it('should be able to dispatch an action to a peer store', () => {
    const store = createHyperStore({
      forwardIncomingActions: () => false,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    dispatchAction(greet({}), store)
    assert.equal(store.actions.incoming.length, 1)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    assert(greet.matches.test(store.actions.outgoing[store.defaultTopic].queue[0]))
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$from == 'id')
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$to == 'all')
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$time <= Date.now())
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$cache === false)
    applyIncomingActions(store)
    assert.equal(store.actions.history.length, 1)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 0)
    clearOutgoingActions(store.defaultTopic, store)
    assert.equal(store.actions.history.length, 1)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 1)
  })

  it('should be able to dispatch an action to a host store', () => {
    const store = createHyperStore({
      forwardIncomingActions: () => true,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    dispatchAction(greet({}), store)
    assert(greet.matches.test(store.actions.incoming[0]))
    assert.equal(store.actions.incoming.length, 1)
    assert(store.actions.incoming[0].$from == 'id')
    assert(store.actions.incoming[0].$to == 'all')
    assert(store.actions.incoming[0].$time <= Date.now())
    assert(store.actions.incoming[0].$cache === false)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    applyIncomingActions(store)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    clearOutgoingActions(store.defaultTopic, store)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
  })

  it('should be able to dispatch an action to a peer store', () => {
    const store = createHyperStore({
      forwardIncomingActions: () => false,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    dispatchAction(greet({}), store)
    assert(greet.matches.test(store.actions.outgoing[store.defaultTopic].queue[0]))
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$from == 'id')
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$to == 'all')
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$time <= Date.now())
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$cache === false)
  })

  it('should be able to add and remove action receptors in a store', () => {
    const store = createHyperStore({
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const receptor = () => {}
    addActionReceptor(receptor, store)
    assert.equal(store.receptors[0], receptor)
    removeActionReceptor(receptor, store)
    assert.equal(store.receptors.length, 0)
  })

  it('should be able to apply incoming actions to receptors in a local store', () => {
    const store = createHyperStore({ getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    let receivedCount = 0
    const receptor = (action) => {
      assert(greet.matches.test(action))
      receivedCount++
    }
    addActionReceptor(receptor, store)
    dispatchAction(greet({}), store)
    applyIncomingActions(store)
    assert.equal(receivedCount, 1)

    const action = greet({})
    dispatchAction(action, store)
    applyIncomingActions(store)
    assert.equal(receivedCount, 2)
    // ensure that the same action is not applied twice
    dispatchAction(action, store)
    applyIncomingActions(store)
    assert.equal(receivedCount, 2)
  })

  it('should add incoming actions to cache as indicated', () => {
    const store = createHyperStore({ getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })

    let receivedCount = 0
    const receptor = (action) => {
      assert(greet.matches.test(action))
      receivedCount++
    }

    addActionReceptor(receptor, store)

    dispatchAction(greet({ $cache: true }), store)
    dispatchAction(greet({ $cache: false }), store)
    dispatchAction(greet({ $cache: true }), store)
    dispatchAction(greet({ $cache: true }), store)
    dispatchAction(greet({ $cache: true }), store)
    applyIncomingActions(store)

    assert.equal(receivedCount, 5)
    assert.equal(store.actions.cached.length, 4)

    dispatchAction(greet({ $cache: { removePrevious: true } }), store)
    applyIncomingActions(store)
    assert.equal(receivedCount, 6)
    assert.equal(store.actions.cached.length, 1)

    dispatchAction(greet({ $cache: true }), store)
    dispatchAction(greet({ $cache: true }), store)
    dispatchAction(greet({ $cache: true }), store)
    let greetAction = greet({ greeting: 'welcome', $cache: true })
    dispatchAction(greetAction, store)
    applyIncomingActions(store)
    assert.equal(receivedCount, 10)
    assert.equal(store.actions.cached.length, 5)
    assert.equal(store.actions.history.at(-1)!['greeting'], 'welcome')

    greetAction = greet({ greeting: 'welcome', $cache: { removePrevious: ['greeting'], disable: true } })
    dispatchAction(greetAction, store)
    applyIncomingActions(store)
    assert.equal(receivedCount, 11)
    assert.equal(store.actions.cached.length, 4)
    assert.equal(store.actions.history.at(-1)!['greeting'], 'welcome')

    dispatchAction(greet({ $from: 'differentUser' as UserId, $cache: { removePrevious: true } }), store)
    applyIncomingActions(store)
    assert.equal(receivedCount, 12)
    assert.equal(store.actions.cached.length, 5)

    dispatchAction(greet({ $cache: { removePrevious: true, disable: true } }), store)
    applyIncomingActions(store)
    assert.equal(receivedCount, 13)
    assert.equal(store.actions.cached.length, 1)

    dispatchAction(greet({ $from: 'differentUser' as UserId, $cache: { removePrevious: true, disable: true } }), store)
    applyIncomingActions(store)
    assert.equal(receivedCount, 14)
    assert.equal(store.actions.cached.length, 0)
  })

  it('should be able to apply incoming actions to receptors in a peer store', () => {
    const store = createHyperStore({
      forwardIncomingActions: () => false,
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
    addActionReceptor(receptor, store)
    dispatchAction(greet({}), store)
    assert(greet.matches.test(store.actions.outgoing[store.defaultTopic].queue[0]))
    store.actions.incoming.push(...store.actions.outgoing[store.defaultTopic].queue)
    clearOutgoingActions(store.defaultTopic, store)
    assert(store.actions.outgoing[store.defaultTopic].queue.length === 0)
    assert(greet.matches.test(store.actions.incoming[0]))
    applyIncomingActions(store)
    assert(receivedAction)
  })

  it('should be able to apply multiple actions at once to a peer store', () => {
    const store = createHyperStore({
      forwardIncomingActions: () => false,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    let receivedCount = 0
    const receptor = (action) => {
      assert(greet.matches.test(action))
      receivedCount++
    }
    addActionReceptor(receptor, store)
    dispatchAction(greet({}), store)
    dispatchAction(greet({}), store)
    dispatchAction(greet({}), store)
    dispatchAction(greet({}), store)
    assert.equal(receivedCount, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 4)
    clearOutgoingActions(store.defaultTopic, store)
    assert.equal(receivedCount, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 4)
    assert.equal(store.actions.incoming.length, 4)
    applyIncomingActions(store)
    assert.equal(receivedCount, 4)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    store.actions.incoming.push(...store.actions.outgoing[store.defaultTopic].history)
    applyIncomingActions(store)
    assert.equal(receivedCount, 4)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
  })

  it('should be able to apply multiple actions at once to a host store', () => {
    const store = createHyperStore({
      forwardIncomingActions: () => true,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    let receivedCount = 0
    const receptor = (action) => {
      assert(greet.matches.test(action))
      receivedCount++
    }
    addActionReceptor(receptor, store)
    dispatchAction(greet({}), store)
    dispatchAction(greet({}), store)
    dispatchAction(greet({}), store)
    dispatchAction(greet({}), store)
    assert.equal(receivedCount, 0)
    assert.equal(store.actions.incoming.length, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    clearOutgoingActions(store.defaultTopic, store)
    assert.equal(receivedCount, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 0)
    assert.equal(store.actions.incoming.length, 4)
    assert.equal(store.actions.history.length, 0)
    applyIncomingActions(store)
    assert.equal(receivedCount, 4)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 0)
    clearOutgoingActions(store.defaultTopic, store)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].historyUUIDs.size, 4)
    const history = Array.from(store.actions.history.values())
    assert.equal(history[1], store.actions.outgoing[store.defaultTopic].history[1])
    assert.equal(history[2], store.actions.outgoing[store.defaultTopic].history[2])
    assert.equal(history[3], store.actions.outgoing[store.defaultTopic].history[3])
    assert.equal(history[4], store.actions.outgoing[store.defaultTopic].history[4])
    assert.equal(receivedCount, 4)
    store.actions.incoming.push(...store.actions.outgoing[store.defaultTopic].history)
    applyIncomingActions(store)
    assert.equal(receivedCount, 4)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].historyUUIDs.size, 4)
  })

  it('should be able to define state and register it to a store', () => {
    const HospitalityState = defineState({
      name: 'hospitality',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })
    const store = createHyperStore({ getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    StateFunctions.registerState(HospitalityState, store)
    assert(store.state.hospitality)
  })

  it('should be able to optionally have an onCreate callback', () => {
    const HospitalityState = defineState({
      name: 'hospitality',
      initial: () => ({
        create: false
      }),
      onCreate: (s, state) => {
        assert.equal(s, store)
        state.create.set(true)
      }
    })
    const store = createHyperStore({ getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    StateFunctions.registerState(HospitalityState, store)
    const hospitality = getState(HospitalityState, store).value
    assert.equal(hospitality.create, true)
  })

  it('should be able to get immutable registered state', () => {
    const HospitalityState = defineState({
      name: 'hospitality',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })
    const store = createHyperStore({ getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    StateFunctions.registerState(HospitalityState, store)
    assert(store.state.hospitality)
    const hospitality = getState(HospitalityState, store).value
    assert.equal(hospitality.greetingCount, 0)
  })

  it('should be able to mutate registered state inside a receptor', () => {
    const HospitalityState = defineState({
      name: 'hospitality',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })

    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })

    const store = createHyperStore({ getDispatchId: () => 'id', getDispatchTime: () => Date.now() })
    StateFunctions.registerState(HospitalityState, store)
    assert(store.state.hospitality)

    addActionReceptor((action) => {
      matches(action).when(greet.matches, () => {})
      const hospitality = getState(HospitalityState, store)
      hospitality.greetingCount.set(100)
    }, store)

    dispatchAction(greet({}), store)
    applyIncomingActions(store)
    assert.equal(getState(HospitalityState, store).greetingCount.value, 100)
  })
})
