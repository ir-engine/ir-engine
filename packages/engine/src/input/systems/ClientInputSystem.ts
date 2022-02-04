import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../components/InputComponent'
import { LocalInputTagComponent } from '../components/LocalInputTagComponent'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { handleGamepads } from '../functions/GamepadInput'
import { addClientInputListeners } from '../functions/clientInputListeners'

export const enableInput = ({ keyboard, mouse }: { keyboard?: boolean; mouse?: boolean }) => {
  if (typeof keyboard !== 'undefined') Engine.keyboardInputEnabled = keyboard
  if (typeof mouse !== 'undefined') Engine.mouseInputEnabled = mouse
}

export default async function ClientInputSystem(world: World) {
  const localClientInputQuery = defineQuery([InputComponent, LocalInputTagComponent])

  addClientInputListeners()

  return () => {
    const { delta } = world

    if (!Engine.xrSession) {
      handleGamepads()
    }

    // for continuous input, figure out if the current data and previous data is the same
    Engine.inputState.forEach((value: InputValue, key: InputAlias) => {
      if (Engine.prevInputState.has(key)) {
        if (value.type === InputType.BUTTON) {
          if (
            value.lifecycleState === LifecycleValue.Started &&
            Engine.prevInputState.get(key)?.lifecycleState === LifecycleValue.Started
          ) {
            value.lifecycleState = LifecycleValue.Continued
          }
        } else {
          if (value.lifecycleState !== LifecycleValue.Ended) {
            value.lifecycleState =
              JSON.stringify(value.value) === JSON.stringify(Engine.prevInputState.get(key)?.value)
                ? LifecycleValue.Unchanged
                : LifecycleValue.Changed
          }
        }

        if (
          Engine.prevInputState.get(key)?.lifecycleState === LifecycleValue.Ended &&
          value.lifecycleState === LifecycleValue.Ended
        ) {
          Engine.inputState.delete(key)
        }
      }
    })

    Engine.prevInputState.clear()
    Engine.inputState.forEach((value: InputValue, key: InputAlias) => {
      Engine.prevInputState.set(key, value)
    })

    // copy client input state to input component
    for (const entity of localClientInputQuery(world)) {
      const inputComponent = getComponent(entity, InputComponent)
      inputComponent.data.clear()
      Engine.inputState.forEach((value: InputValue, key: InputAlias) => {
        if (inputComponent.schema.inputMap.has(key)) {
          inputComponent.data.set(inputComponent.schema.inputMap.get(key)!, JSON.parse(JSON.stringify(value)))
        }
      })

      inputComponent.data.forEach((value: InputValue, key: InputAlias) => {
        if (inputComponent.schema.behaviorMap.has(key)) {
          inputComponent.schema.behaviorMap.get(key)!(entity, key, value, delta)
        }
      })
    }
  }
}
