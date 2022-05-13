## HyperFlux

HyperFlux brings together various state management strategies in XREngine, in a way that makes it easy to introspect and test. 

In XREngine, we define 3 different stores

The ENGINE store is _non-networked_, meaning actions are dispatched directly on the _**incoming**_ queue, and run on the Engine timer. 

```ts
createHyperStore({
    name: 'ENGINE',
    getDispatchId: () => 'engine',
    getDispatchTime: () => Engine.instance.elapsedTime
})
// Engine timer callback:
const executeWorlds = (elapsedTime) => {
  ActionFunctions.applyIncomingActions(Engine.instance.store)
  // ...
}
```

The WORLD store is _networked_, meaning actions are dispatched directly on the _**outgoing**_ queue, and run on the world's fixed tick.

```ts
createHyperStore({
    name: 'WORLD',
    networked: true,
    getDispatchId: () => Engine.instance.userId,
    getDispatchTime: () => this.fixedTick, // world.fixedTick
    defaultDispatchDelay: 1
})
// IncomingActionSystem
import { applyIncomingActions } from '@xrengine/hyperflux'
export default async function IncomingActionSystem(world) {
  return () => {
    applyIncomingActions(world.store)
  }
}

```

The CLIENT store is _non-networked_, and runs on a setInterval. 

In any case, the appropriate store must be provided when dispatching an action:

```ts
dispatchAction(world.store, NetworkWorldAction.spawnAvatar({ parameters }))
  ```

Likewise when adding or removing receptors:
```ts
addActionReceptor(world.store, (a) =>
    matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
)
```

State objects can also be defined and registered on a store:

```ts
const PeerState = defineState('peers', () => {
    return [] // initial state
})

registerState(world.store, PeerState)

// get immutable state
const peerState = getState(world.store, PeerState)

// or, get mutable state (if and only if in a receptor function)
const mutablePeerState = getMutableState(world.store, PeerState)
```

All incoming, outoing, and historical actions accessible on the `store.actions` object. 

