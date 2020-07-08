import { System } from 'ecsy'
import { Object3DComponent } from 'ecsy-three'

import { Rotating } from '../components/'

// According to the ECSY documentation, entities and components should be modified from systems.
// You could probably modify them elsewhere, but this seems to be the most accepted and scoped place.
class RotationSystem extends System {
  // execute runs every frame. delta is the amount of time since the last call to execute.
  execute (delta: number): void {
    // queries.X.results gets everything that matches that result.
    // queries.X.changed gets only the entities that have changed.
    // There's also queries.X.added and queries.X.removed.
    this.queries.entities.results.forEach(entity => {
      // entity.getComponent will get a component in a read-only state. If you want to modify it, you must
      // use .getMutableComponent
      const rotation = (entity.getMutableComponent(Object3DComponent) as any).value.rotation;
      (rotation.x as number) += 0.5 * delta;
      (rotation.y as number) += 0.1 * delta
    })
  }
}

// This is how you set which entities you want to attach a system to (you can also set it inside the system by
// using this.queries = {<blah>})
// components is a list of Components; if an entity has all of those Components, then the system will affect it.
// If it's missing at least one of those Components, it will be ignored by that system.
// listen.changed/removed/added will apply only to changes/additions/removals of those types of Components
RotationSystem.queries = {
  entities: {
    components: [Rotating, Object3DComponent],
    listen: {
      // changed: [Object3DComponent]
    }
  }
}

export default RotationSystem
