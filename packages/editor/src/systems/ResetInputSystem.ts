import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { InputComponent } from '../classes/InputComponent'
import { ActionKey } from '../controls/input-mappings'

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function ResetInputSystem(_: World): Promise<System> {
  const inputQuery = defineQuery([InputComponent])
  return () => {
    for (const entity of inputQuery()) {
      const inputComponent = getComponent(entity, InputComponent)
      inputComponent.resetKeys?.forEach((key: ActionKey) => {
        const actionState = inputComponent.actionState[key]
        const initialActionState = inputComponent.defaultState[key]
        // BUG: this.defaultState might not be correct
        if (typeof actionState === 'object' && typeof inputComponent.defaultState === 'object') {
          inputComponent.actionState[key] = Object.assign(inputComponent.actionState[key] ?? {}, initialActionState)
        } else {
          inputComponent.actionState[key] = initialActionState
        }
      })
    }
  }
}
