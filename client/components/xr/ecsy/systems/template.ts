import { System } from 'ecsy'
import { Object3DComponent } from 'ecsy-three'

// According to the ECSY documentation, entities and components should be modified from systems.
// You could probably modify them elsewhere, but this seems to be the most accepted and scoped place.
class MySystem extends System {
  someProp: any

  init (someProp): void {
    this.someProp = someProp
  }

  // execute runs every frame. delta is the amount of time since the last call to execute.
  execute (delta): void {
    console.log(delta)
    // There's also queries.X.added and queries.X.removed.
    this.queries.entities.results.forEach(entity => {
      // entity.getComponent will get a component in a read-only state. If you want to modify it, you must
      // use .getMutableComponent
      console.log(entity)
    })

    this.queries.entities.added.forEach(entity => { console.log(entity) })
    this.queries.entities.removed.forEach(entity => { console.log(entity) })
    this.queries.entities.changed.forEach(entity => { console.log(entity) })
  }
}

MySystem.queries = {
  entities: {
    components: [Object3DComponent],
    // reactive queries
    listen: {
      added: true,
      removed: false
      // changed: [Object3DComponent]
    }
  }
}

export default MySystem
