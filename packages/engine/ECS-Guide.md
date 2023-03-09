# ECS

ECS stands for Entity Component System. It is a pattern for organising data and objects that allows for composition over inheritance. An entity is simply a number that points to a particular set of data contained in components. Systems then operate logic on these entities and components.

```ts
import { createEntity } from "@etherealengine/engine/src/ecs/functions/EntityFunctions"
import { 
  addComponent,
  createMappedComponent,
  defineQuery,
  getComponent
} from "@etherealengine/engine/src/ecs/functions/ComponentFunctions"

export const TimerComponent = createMappedComponent<{ time: number }>('TimerComponent')

export default async function TimerSystem() {

  const myEntity = createEntity()
  addComponent(myEntity, TimerComponent, { time: 0 })

  const timerQuery = defineQuery([TimerComponent])

  return () => {
    const { delta } = Engine.instance

    for (const entity of timerQuery()) {
      const timerComponent = getComponent(entity, TimerComponent)
      timerComponent.time += delta
    }

  }
}

```