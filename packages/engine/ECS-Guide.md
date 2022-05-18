# ECS

ECS stands for Entity Component System. It is a pattern for organising data and objects that allows for composition over inheritance. An entity is simply a number that points to a particular set of data contained in components. Systems then operate logic on these entities and components.

```ts
import { createEntity } from "@xrengine/engine/src/ecs/functions/EntityFunctions"
import { System } from "@xrengine/engine/src/ecs/classes/System"
import { World } from "@xrengine/engine/src/ecs/classes/World"
import { 
  addComponent,
  createMappedComponent,
  defineQuery,
  getComponent
} from "@xrengine/engine/src/ecs/functions/ComponentFunctions"

export const TimerComponent = createMappedComponent<{ time: number }>('TimerComponent')

export default async function TimerSystem (world: World): Promise<System> {

  const myEntity = createEntity()
  addComponent(myEntity, TimerComponent, { time: 0 })

  const timerQuery = defineQuery([TimerComponent])

  return () => {
    const { delta } = world

    for (const entity of timerQuery(world)) {
      const timerComponent = getComponent(entity, TimerComponent)
      timerComponent.time += delta
    }

  }
}

```