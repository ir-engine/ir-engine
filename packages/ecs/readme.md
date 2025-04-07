## ECS Component and Entity Functions

The ECS package provides a fast and reactive Entity-Component-System architecture implementation, using bitECS, hookstate and react.

### defineComponent

Creates a new component type.

```typescript
import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'

const PositionComponent = defineComponent({
  name: 'PositionComponent',
  schema: {
    x: 0,
    y: 0,
    z: 0
  }
})
```

### setComponent

Attaches a component to an entity, initializing it with optional data.

```typescript
import { createEntity } from '@ir-engine/ecs/src/ComponentFunctions'
import { setComponent } from '@ir-engine/ecs/src/ComponentFunctions'

const entity = createEntity()
setComponent(entity, PositionComponent, { x: 10, y: 20, z: 30 })
```

### getComponent

Retrieves a component from an entity, throwing an error if it’s not found.

```typescript
import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'

const position = getComponent(entity, PositionComponent)
console.log(position.x, position.y, position.z)
```

### getOptionalComponent

Returns the component value if present, or `undefined` if the entity does not have it.

```typescript
import { getOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'

const maybePosition = getOptionalComponent(entity, PositionComponent)
if (maybePosition) {
  console.log('Position found:', maybePosition.x)
} else {
  console.log('Component not present.')
}
```

### getMutableComponent

Returns a mutable state reference for the component that can be updated.

```typescript
import { getMutableComponent } from '@ir-engine/ecs/src/ComponentFunctions'

const mutablePosition = getMutableComponent(entity, PositionComponent)
mutablePosition.x.set(15)
```

### deserializeComponent

Initializes or updates a component on an entity from serialized JSON data.

```typescript
import { deserializeComponent } from '@ir-engine/ecs/src/ComponentFunctions'

const serializedData = { x: 5, y: 10, z: 15 }
deserializeComponent(entity, PositionComponent, serializedData)
const updatedPosition = getComponent(entity, PositionComponent)
console.log(updatedPosition)
```

### removeComponent

Removes a component from an entity.

```typescript
import { removeComponent } from '@ir-engine/ecs/src/ComponentFunctions'

removeComponent(entity, PositionComponent)
```

### useComponent

A React hook that subscribes to component state changes. Useful in logic reactors or displaying information in user interfaces.

```tsx
import React from 'react'
import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

function PositionReactor({ entity }: { entity: number }) {
  const position = useComponent(entity, PositionComponent)

  return (
    <div>
      Position: {position.value.x}, {position.value.y}, {position.value.z}
    </div>
  )
}
```

### useOptionalComponent

React hook that returns optional component state.

```tsx
import React from 'react'
import { useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'

function OptionalPositionReactor({ entity }: { entity: number }) {
  const position = useOptionalComponent(entity, PositionComponent)

  return (
    <div>
      {position ? (
        <>
          Position: {position.value.x}, {position.value.y}, {position.value.z}
        </>
      ) : (
        <>Position not set.</>
      )}
    </div>
  )
}
```

### createEntity

Creates a new entity in the ECS.

```typescript
import { createEntity } from '@ir-engine/ecs/src/ComponentFunctions'

const newEntity = createEntity()
```

### removeEntity

Removes an entity from the ECS, cleaning up all its components.

```typescript
import { removeEntity } from '@ir-engine/ecs/src/ComponentFunctions'

removeEntity(newEntity)
```
