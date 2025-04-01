# @ir-engine/hyperflux

**Hyperflux** is a reactive state management library designed for both local and agent-centric networked applications. It builds on Hookstate and provides utilities to define and manage state, create and dispatch type-safe and validated actions, and integrate with React via reactors. It lets you:

- **Create an agent store:** Initialize a store with `createHyperStore`.
- **Define state slices:** Use `defineState` to create strongly typed state definitions.
- **Access state data:** Retrieve immutable read-only state with `getState` or mutable state using `getMutableState`.
- **Define actions:** Create strongly typed actions with `defineAction` and dispatch them with `dispatchAction`.
- **Start reactors:** Start an isolated detatched React tree for purely reactive logic operations with `startReactor`.

---

### Example Usage

#### Creating a HyperStore

```typescript
import { createHyperStore } from '@ir-engine/hyperflux'

const store = createHyperStore({
  getDispatchTime: () => Date.now(),
  defaultDispatchDelay: () => 0
})
```

#### Defining and Accessing State

```typescript
import { defineState, getState, getMutableState } from '@ir-engine/hyperflux'

const CounterState = defineState({
  name: 'counter',
  initial: () => ({
    count: 0
  })
})

// Get read-only immutable state snapshot
const currentCount = getState(CounterState).count

// Get mutable state reference to update the state reactively
const counter = getMutableState(CounterState)
counter.count.set(counter.count.get() + 1)
```

#### Defining and Dispatching Actions

```typescript
import { defineAction, dispatchAction, matchesWithDefault, matches } from '@ir-engine/hyperflux'

// Define an action that increments a counter
const increment = defineAction({
  type: 'INCREMENT',
  amount: matchesWithDefault(matches.number, () => 1)
})

// Create and dispatch the action
dispatchAction(increment({ amount: 5 }))
```

#### Starting a Reactor

```tsx
import React from 'react'
import { useHookstate, startReactor, getState, getMutableState, defineState } from '@ir-engine/hyperflux'

// Define state used in the reactor
const MessageState = defineState({
  name: 'message',
  initial: () => ({
    text: 'Hello, Hyperflux!'
  })
})

// A simple React component as a reactor
function MessageReactor() {
  const message = useHookstate(getMutableState(MessageState).text).value

  useEffect(() => {
    alert(message)
  }, [message])

  return null
}

// Start the reactor to render the component
startReactor(MessageReactor)
```

#### Using Receptors with State Definitions

Receptors are functions that listen for specific actions and update the state accordingly. They are defined within the state definition and are automatically invoked when the corresponding action is dispatched. Below is a basic counter application where we can increment, decrement, and reset the counter.

```typescript
import React, { useLayoutEffect } from 'react'
import {
  defineState,
  dispatchAction,
  getMutableState,
  matches,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'

// Define actions for the counter
export class CounterActions {
  static increment = defineAction({
    type: 'counter.INCREMENT',
    amount: matches.number
  })

  static decrement = defineAction({
    type: 'counter.DECREMENT',
    amount: matches.number
  })

  static reset = defineAction({
    type: 'counter.RESET'
  })
}

// Define the state for the counter
export const CounterState = defineState({
  name: 'counter.CounterState',

  initial: {
    count: 0
  },

  receptors: {
    onIncrement: CounterActions.increment.receive((action) => {
      getMutableState(CounterState).count.set((prev) => prev + action.amount)
    }),

    onDecrement: CounterActions.decrement.receive((action) => {
      getMutableState(CounterState).count.set((prev) => prev - action.amount)
    }),

    onReset: CounterActions.reset.receive(() => {
      getMutableState(CounterState).count.set(0)
    })
  }
})

// Counter component to display and interact with the counter
const Counter = () => {
  const state = useHookstate(getMutableState(CounterState))

  return (
    <div>
      <h1>Counter: {state.count.value}</h1>
      <button onClick={() => dispatchAction(CounterActions.increment({ amount: 1 }))}>Increment</button>
      <button onClick={() => dispatchAction(CounterActions.decrement({ amount: 1 }))}>Decrement</button>
      <button onClick={() => dispatchAction(CounterActions.reset())}>Reset</button>
    </div>
  )
}

export default Counter
```

In this example, the `CounterState` has several receptors that listen for different actions defined in `CounterActions`. When an action is dispatched, the corresponding receptor updates the state.

Note: `applyIncomingActions` must be run for actions to be received and processed.


#### Event Sourcing and Agent-Centric Networking

Event sourcing is a design pattern that involves storing all changes to an application's state as a sequence of events. These events can be retroactively combined out of order, as network latency or connection occurs, and replayed to recreate the same eventually-consistent state at any point in time. This final state is what side effects are applied according to, ensuring all agents end up with the same simulation.