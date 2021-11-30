import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../components/InputComponent'
import { LocalInputTagComponent } from '../components/LocalInputTagComponent'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'
import { useEngine } from '../../ecs/classes/Engine'
import { handleGamepads } from '../functions/GamepadInput'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'

export const enableInput = ({ keyboard, mouse }: { keyboard?: boolean; mouse?: boolean }) => {
  if (typeof keyboard !== 'undefined') useEngine().keyboardInputEnabled = keyboard
  if (typeof mouse !== 'undefined') useEngine().mouseInputEnabled = mouse
}

export default async function ClientInputSystem(world: World): Promise<System> {
  const localClientInputQuery = defineQuery([InputComponent, LocalInputTagComponent])

  return () => {
    const { delta } = world

    if (!useEngine().xrSession) {
      // handleGamepads()
    }

    // for continuous input, figure out if the current data and previous data is the same
    useEngine().inputState.forEach((value: InputValue, key: InputAlias) => {
      if (useEngine().prevInputState.has(key)) {
        if (value.type === InputType.BUTTON) {
          if (
            value.lifecycleState === LifecycleValue.Started &&
            useEngine().prevInputState.get(key)?.lifecycleState === LifecycleValue.Started
          ) {
            value.lifecycleState = LifecycleValue.Continued
          }
        } else {
          if (value.lifecycleState !== LifecycleValue.Ended) {
            value.lifecycleState =
              JSON.stringify(value.value) === JSON.stringify(useEngine().prevInputState.get(key)?.value)
                ? LifecycleValue.Unchanged
                : LifecycleValue.Changed
          }
        }

        if (
          useEngine().prevInputState.get(key)?.lifecycleState === LifecycleValue.Ended &&
          value.lifecycleState === LifecycleValue.Ended
        ) {
          useEngine().inputState.delete(key)
        }
      }
    })

    useEngine().prevInputState.clear()
    useEngine().inputState.forEach((value: InputValue, key: InputAlias) => {
      useEngine().prevInputState.set(key, value)
    })

    // copy client input state to input component
    for (const entity of localClientInputQuery(world)) {
      const inputComponent = getComponent(entity, InputComponent)
      inputComponent.data.clear()
      useEngine().inputState.forEach((value: InputValue, key: InputAlias) => {
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
