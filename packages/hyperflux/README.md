## HyperFlux

HyperFlux brings together various state management strategies in XREngine, in a way that makes it easy to introspect and test. 

In XREngine, we define 3 different stores

The ENGINE store is, meaning actions are dispatched directly on the _**incoming**_ queue, and run on the Engine timer. 

```ts
createHyperStore({
  name: 'ENGINE',
  getDispatchId: () => 'engine',
  getDispatchTime: () => Engine.instance.elapsedTime
})
```

```ts
// IncomingActionSystem
import { applyIncomingActions } from '@xrengine/hyperflux'
export default async function IncomingActionSystem(world) {
  return () => {
    applyIncomingActions(Engine.instance.store)
  }
}

```


In any case, the appropriate store must be provided when dispatching an action:

```ts
dispatchAction( WorldNetworkAction.spawnAvatar({ parameters }))
  ```

Likewise when adding or removing receptors:
```ts
addActionReceptor((a) =>
  matches(a).when(WorldNetworkAction.spawnObject.matches, (a) => recepted.push(a))
)
```

State objects can also be defined and retrieved from a store:

```ts
const PeerState = defineState('peers', () => {
    return [] // initial state
})

// get state
const peerState = getState(Engine.instance.store, PeerState)
```

All incoming, outoing, and historical actions accessible on the `store.actions` object. 

