import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { InputComponent } from '../classes/InputComponent'

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function InputSystem(_: World): Promise<System> {
  const inputQuery = defineQuery([InputComponent])
  return () => {
    for (const entity of inputQuery()) {
      const inputComponent = getComponent(entity, InputComponent)
      const computed = inputComponent.activeMapping?.computed

      if (!computed) return

      for (let i = 0; i < computed.length; i++) {
        inputComponent.actionState[computed[i].action] = computed[i].transform()
      }
    }
  }
}
