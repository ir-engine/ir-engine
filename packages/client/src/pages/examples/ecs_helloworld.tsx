import { Component } from '@xrengine/engine/src/ecs/classes/Component'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { execute } from '@xrengine/engine/src/ecs/functions/EngineFunctions'
import { addComponent, createEntity, removeComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { Types } from '@xrengine/engine/src/ecs/types/Types'
import React from 'react'

// This is a component. Components are added to entities. Components hold state, but not logic -- this one holds a name
class NameComponent extends Component<NameComponent> {
  name: string
}

// Components need to have a schema so that they can construct efficiently
NameComponent._schema = {
  name: { type: Types.String, default: 'HelloWorld' }
}

// This is a system. Systems are usually stateless and logical, and perform operations on components.
// Systems can also have non-simulation side effects (input/output).
class NameSystem extends System {
  updateType = SystemUpdateType.Fixed
  /**
   * Execute the camera system for different events of queries.\
   * Called each frame by default.
   *
   * @param delta time since last frame.
   */
  execute(delta: number): void {
    for (const entity of this.queryResults.names.added) {
      console.log('Added component to entity', entity.id)
      removeComponent(entity, NameComponent)
    }

    for (const entity of this.queryResults.names.removed) {
      console.log('Removed component on entity', entity.id)
      setTimeout(() => {
        addComponent(entity, NameComponent)
      }, 100)
    }
  }
}

// If all of the components (or Not() components) match, this system will see that entity in their query
// Queries fire special listener events (added, removed, changed) *if* they are listened for
NameSystem.queries = {
  names: {
    components: [NameComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}

// This is a functional React component
const HelloWorld = () => {
  // Register our system with the engine
  registerSystem(NameSystem)
  // Create a new entity
  const myEntity = createEntity()
  // Add a name component to it
  addComponent(myEntity, NameComponent)
  // Create a simple timer
  setInterval(() => {
    // We're only executing fixed update systems, but there are other update types
    execute(0.1, 0, SystemUpdateType.Fixed)
  }, 100)
  // Some JSX to keep the compiler from complaining
  return <div>Hello World!!!</div>
}

export default HelloWorld
