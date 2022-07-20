import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { EditorInputComponent } from '../classes/InputComponent'
import { ActionKey } from '../controls/input-mappings'

export default async function ResetInputSystem(_: World) {
  const inputQuery = defineQuery([EditorInputComponent])
  return () => {
    for (const entity of inputQuery()) {
      const inputComponent = getComponent(entity, EditorInputComponent)
      inputComponent.resetKeys?.forEach((key: ActionKey) => {
        const actionState = inputComponent.actionState[key]
        const initialActionState = inputComponent.defaultState[key]

        if (typeof actionState === 'object' && typeof initialActionState === 'object') {
          inputComponent.actionState[key] = Object.assign(inputComponent.actionState[key] ?? {}, initialActionState)
        } else {
          inputComponent.actionState[key] = initialActionState
        }
      })
    }
  }
}
