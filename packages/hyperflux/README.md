## HyperFlux

HyperFlux brings together various state management strategies in XREngine, in a way that makes it easy to introspect and test. 

In XREngine, we define 3 different stores

The ENGINE store is _non-networked_, meaning actions are dispatched directly on the _**incoming**_ queue, and run on the Engine timer. 

```ts
createHyperStore({
    name: 'ENGINE',
    getDispatchId: () => 'engine',
    getDispatchTime: () => Engine.elapsedTime
})
```

The WORLD store is _networked_, meaning actions are dispatched directly on the _**outgoing**_ queue, and run on the world's fixed tick.

```ts
createHyperStore({
    name: 'WORLD',
    networked: true,
    getDispatchId: () => Engine.userId,
    getDispatchTime: () => this.fixedTick,
    defaultDispatchDelay: 1
})
```

Tne CLIENT store is _non-networked_, and runs on a setInterval. 

In any case, the appropriate store must be provided when dispatching an action:

```ts
dispatchAction(world.store, NetworkWorldAction.spawnAvatar({ parameters }))
  ```

Likewise when adding receptors:
```ts
addActionReceptor(world.store, (a) =>
    matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
)
```


