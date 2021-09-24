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

export async function TimerSystem (world: World): Promise<System> {

	
  const myEntity = createEntity()
  addComponent(myEntity, TimerComponent, { time: 0 })

  const timerQuery = defineQuery([TimerComponent])

  return () => {
    const { delta } = world

    for (const entity of timerQuery(world)) {
      const timerComponent = getComponent(entity, TimerComponent)
      timerComponent.time += delta
      console.log(timerComponent.time)
    }

  }
}

export const time=()=>{
  console.clear()
  console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx")
  console.log("THis is the function")
}