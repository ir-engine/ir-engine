/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'

import { matches, matchesWithDefault } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'

import {
  applyIncomingActions,
  clearOutgoingActions,
  createHyperStore,
  defineAction,
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  removeActionQueue
} from '..'

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
    dispatchAction(greet({}))
    assert.equal(store.actions.incoming.length, 1)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    assert(greet.matches.test(store.actions.incoming[0]))
    assert(store.actions.incoming[0].$from == 'id')
    assert(store.actions.incoming[0].$to == 'all')
    assert(store.actions.incoming[0].$time <= Date.now())
    assert(store.actions.incoming[0].$cache === false)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 1)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    clearOutgoingActions(store.defaultTopic)
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
    dispatchAction(greet({}))
    assert.equal(store.actions.incoming.length, 1)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    assert(greet.matches.test(store.actions.outgoing[store.defaultTopic].queue[0]))
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$from == 'id')
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$to == 'all')
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$time <= Date.now())
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$cache === false)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 1)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 0)
    clearOutgoingActions(store.defaultTopic)
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
    dispatchAction(greet({}))
    assert(greet.matches.test(store.actions.incoming[0]))
    assert.equal(store.actions.incoming.length, 1)
    assert(store.actions.incoming[0].$from == 'id')
    assert(store.actions.incoming[0].$to == 'all')
    assert(store.actions.incoming[0].$time <= Date.now())
    assert(store.actions.incoming[0].$cache === false)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    applyIncomingActions()
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    clearOutgoingActions(store.defaultTopic)
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
    dispatchAction(greet({}))
    assert(greet.matches.test(store.actions.outgoing[store.defaultTopic].queue[0]))
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$from == 'id')
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$to == 'all')
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$time <= Date.now())
    assert(store.actions.outgoing[store.defaultTopic].queue[0].$cache === false)
  })

  it('should add incoming actions to cache as indicated', () => {
    const store = createHyperStore({
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })

    dispatchAction(greet({ $cache: true }))
    dispatchAction(greet({ $cache: false }))
    dispatchAction(greet({ $cache: true }))
    dispatchAction(greet({ $cache: true }))
    dispatchAction(greet({ $cache: true }))
    applyIncomingActions()

    assert.equal(store.actions.history.length, 5)
    assert.equal(store.actions.cached.length, 4)

    dispatchAction(greet({ $cache: { removePrevious: true } }))
    applyIncomingActions()
    assert.equal(store.actions.history.length, 6)
    assert.equal(store.actions.cached.length, 1)

    dispatchAction(greet({ $cache: true }))
    dispatchAction(greet({ $cache: true }))
    dispatchAction(greet({ $cache: true }))
    let greetAction = greet({ greeting: 'welcome', $cache: true })
    dispatchAction(greetAction)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 10)
    assert.equal(store.actions.cached.length, 5)
    assert.equal(store.actions.history.at(-1)!['greeting'], 'welcome')

    greetAction = greet({ greeting: 'welcome', $cache: { removePrevious: ['greeting'], disable: true } })
    dispatchAction(greetAction)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 11)
    assert.equal(store.actions.cached.length, 4)
    assert.equal(store.actions.history.at(-1)!['greeting'], 'welcome')

    dispatchAction(greet({ $from: 'differentUser' as UserID, $cache: { removePrevious: true } }))
    applyIncomingActions()
    assert.equal(store.actions.history.length, 12)
    assert.equal(store.actions.cached.length, 5)

    dispatchAction(greet({ $cache: { removePrevious: true, disable: true } }))
    applyIncomingActions()
    assert.equal(store.actions.history.length, 13)
    assert.equal(store.actions.cached.length, 1)

    dispatchAction(greet({ $from: 'differentUser' as UserID, $cache: { removePrevious: true, disable: true } }))
    applyIncomingActions()
    assert.equal(store.actions.history.length, 14)
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
    dispatchAction(greet({}))
    assert(greet.matches.test(store.actions.outgoing[store.defaultTopic].queue[0]))
    store.actions.incoming.push(...store.actions.outgoing[store.defaultTopic].queue)
    clearOutgoingActions(store.defaultTopic)
    assert(store.actions.outgoing[store.defaultTopic].queue.length === 0)
    assert(greet.matches.test(store.actions.incoming[0]))
    applyIncomingActions()
    assert(store.actions.history.length)
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
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    assert.equal(store.actions.history.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 4)
    clearOutgoingActions(store.defaultTopic)
    assert.equal(store.actions.history.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 4)
    assert.equal(store.actions.incoming.length, 4)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    store.actions.incoming.push(...store.actions.outgoing[store.defaultTopic].history)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 4)
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
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    assert.equal(store.actions.history.length, 0)
    assert.equal(store.actions.incoming.length, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    clearOutgoingActions(store.defaultTopic)
    assert.equal(store.actions.history.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 0)
    assert.equal(store.actions.incoming.length, 4)
    assert.equal(store.actions.history.length, 0)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 0)
    clearOutgoingActions(store.defaultTopic)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].forwardedUUIDs.size, 4)
    const history = Array.from(store.actions.history.values())
    assert.equal(history[1], store.actions.outgoing[store.defaultTopic].history[1])
    assert.equal(history[2], store.actions.outgoing[store.defaultTopic].history[2])
    assert.equal(history[3], store.actions.outgoing[store.defaultTopic].history[3])
    assert.equal(history[4], store.actions.outgoing[store.defaultTopic].history[4])
    assert.equal(store.actions.history.length, 4)
    store.actions.incoming.push(...store.actions.outgoing[store.defaultTopic].history)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].forwardedUUIDs.size, 4)
  })

  it('should be able to define state and register it to a store', () => {
    const HospitalityState = defineState({
      name: 'test.hospitality.0',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })
    const store = createHyperStore({
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    assert(store.stateMap['test.hospitality.0'])
  })

  it('should be able to optionally have an onCreate callback', () => {
    const HospitalityState = defineState({
      name: 'test.hospitality.1',
      initial: () => ({
        create: false
      }),
      onCreate: (s, state) => {
        assert.equal(s, store)
        state.create.set(true)
      }
    })
    const store = createHyperStore({
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const hospitality = getMutableState(HospitalityState).value
    assert.equal(hospitality.create, true)
  })

  it('should be able to get immutable registered state', () => {
    const HospitalityState = defineState({
      name: 'test.hospitality.2',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })
    const store = createHyperStore({
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    assert(store.stateMap['test.hospitality.2'])
    const hospitality = getMutableState(HospitalityState).value
    assert.equal(hospitality.greetingCount, 0)
  })

  it('should be able to mutate registered state', () => {
    const HospitalityState = defineState({
      name: 'test.hospitality.3',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })

    const store = createHyperStore({
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    assert(store.stateMap['test.hospitality.3'])

    const hospitality = getMutableState(HospitalityState)
    hospitality.greetingCount.set(100)

    assert.equal(getState(HospitalityState).greetingCount, 100)
  })

  it('should be able to create action queues', () => {
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    const goodbye = defineAction({
      type: 'TEST_GOODBYE',
      greeting: matchesWithDefault(matches.string, () => 'bye')
    })
    const store = createHyperStore({
      forwardIncomingActions: () => true,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })
    const queue = defineActionQueue([greet.matches, goodbye.matches])
    assert.equal(queue().length, 0)
    dispatchAction(greet({}))
    dispatchAction(goodbye({}))
    assert.equal(queue().length, 0)
    dispatchAction(greet({}))
    dispatchAction(goodbye({}))
    applyIncomingActions()
    const actions = queue()
    assert.equal(actions.length, 4)
    assert(greet.matches.test(actions[0]))
    assert(goodbye.matches.test(actions[1]))
    assert(greet.matches.test(actions[2]))
    assert(goodbye.matches.test(actions[3]))
  })

  it('should be able to create action queues with out-of-order action handling', () => {
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    const goodbye = defineAction({
      type: 'TEST_GOODBYE',
      greeting: matchesWithDefault(matches.string, () => 'bye')
    })
    const store = createHyperStore({
      forwardIncomingActions: () => true,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })

    const queue = defineActionQueue([greet.matches, goodbye.matches])
    dispatchAction(goodbye({ $time: 200 }))
    dispatchAction(greet({ $time: 100 }))
    applyIncomingActions()

    const actions = queue()
    assert.equal(actions.length, 2)
    assert(greet.matches.test(actions[0]))
    assert(goodbye.matches.test(actions[1]))
  })

  it('should be able to create multiple action queues of the same type, that are independently managed', () => {
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    const goodbye = defineAction({
      type: 'TEST_GOODBYE',
      greeting: matchesWithDefault(matches.string, () => 'bye')
    })
    const store = createHyperStore({
      forwardIncomingActions: () => true,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })

    const queue1 = defineActionQueue([greet.matches, goodbye.matches])
    const queue2 = defineActionQueue([greet.matches, goodbye.matches])
    dispatchAction(goodbye({ $time: 200 }))
    dispatchAction(greet({ $time: 100 }))
    applyIncomingActions()

    const actions1 = queue1()
    assert.equal(actions1.length, 2)
    assert(greet.matches.test(actions1[0]))
    assert(goodbye.matches.test(actions1[1]))
    removeActionQueue(queue1)

    const actions2 = queue2()
    assert.equal(actions2.length, 2)
    assert(greet.matches.test(actions2[0]))
    assert(goodbye.matches.test(actions2[1]))
  })

  it('should be able to create action queues that reset when given actions out of order', () => {
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    const goodbye = defineAction({
      type: 'TEST_GOODBYE',
      greeting: matchesWithDefault(matches.string, () => 'bye')
    })
    const store = createHyperStore({
      forwardIncomingActions: () => true,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })

    let didReset = false
    const queue = defineActionQueue([greet.matches, goodbye.matches], {
      onReset: () => {
        didReset = true
      }
    })
    dispatchAction(goodbye({ $time: 200 }))
    dispatchAction(greet({ $time: 100 }))
    applyIncomingActions()

    const actions1 = queue()
    assert.equal(actions1.length, 2)
    assert(greet.matches.test(actions1[0]))
    assert(goodbye.matches.test(actions1[1]))
    assert(didReset)

    didReset = false
    dispatchAction(greet({ $time: 300 }))
    applyIncomingActions()
    const actions2 = queue()
    assert(didReset === false)
    assert.equal(actions2.length, 1)
    assert(greet.matches.test(actions2[0]))

    didReset = false
    dispatchAction(goodbye({ $time: 50 }))
    applyIncomingActions()
    const actions3 = queue()
    assert(didReset)
    assert.equal(actions3.length, 4)
    assert(goodbye.matches.test(actions3[0]))
    assert(greet.matches.test(actions3[1]))
    assert(goodbye.matches.test(actions3[2]))
    assert(greet.matches.test(actions3[3]))
  })

  it('should be able to create networked state with receptors', () => {
    const greet = defineAction({
      type: 'TEST_GREETING',
      greeting: matchesWithDefault(matches.string, () => 'hi')
    })
    const goodbye = defineAction({
      type: 'TEST_GOODBYE',
      greeting: matchesWithDefault(matches.string, () => 'bye')
    })

    const HospitalityState = defineState({
      name: 'test.hospitality',

      initial: () => ({
        greetingCount: 0,
        firstGreeting: null as string | null
      }),

      receptors: {
        onGreet: greet.receive((action) => {
          const state = getMutableState(HospitalityState)
          state.greetingCount.set((v) => v + 1)
          if (!state.firstGreeting.value) state.firstGreeting.set(action.greeting)
        }),
        onGoodbye: goodbye.receive((action) => {
          const state = getMutableState(HospitalityState)
          state.greetingCount.set((v) => v - 1)
          if (!state.firstGreeting.value) state.firstGreeting.set(action.greeting)
        })
      }
    })

    const store = createHyperStore({
      forwardIncomingActions: () => true,
      getDispatchId: () => 'id',
      getDispatchTime: () => Date.now()
    })

    const hospitality = getMutableState(HospitalityState)

    dispatchAction(greet({ $time: 100 }))
    dispatchAction(goodbye({ $time: 100 }))
    dispatchAction(greet({ $time: 100 }))
    applyIncomingActions()

    assert.equal(hospitality.greetingCount.value, 1)
    assert.equal(hospitality.firstGreeting.value, 'hi')

    dispatchAction(goodbye({ $time: 50 }))
    applyIncomingActions()

    assert.equal(hospitality.greetingCount.value, 0)
    assert.equal(hospitality.firstGreeting.value, 'bye')
  })
})
