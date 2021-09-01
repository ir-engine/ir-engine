import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { InputComponent } from '../components/InputComponent'
import { LocalInputTagComponent } from '../components/LocalInputTagComponent'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'
import { Engine } from '../../ecs/classes/Engine'
import { handleGamepads } from '../functions/GamepadInput'
import { defineQuery, defineSystem, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'

export const enableInput = ({ keyboard, mouse }: { keyboard?: boolean; mouse?: boolean }) => {
  if (typeof keyboard !== 'undefined') Engine.keyboardInputEnabled = keyboard
  if (typeof mouse !== 'undefined') Engine.mouseInputEnabled = mouse
}

export const ClientInputSystem = async (): Promise<System> => {
  const localClientInputQuery = defineQuery([InputComponent, LocalInputTagComponent])

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    if (!Engine.xrSession) {
      handleGamepads()
    }

    Engine.prevInputState.clear()
    Engine.inputState.forEach((value: InputValue, key: InputAlias) => {
      Engine.prevInputState.set(key, value)
    })

    // for continuous input, figure out if the current data and previous data is the same
    Engine.inputState.forEach((value: InputValue, key: InputAlias) => {
      if (
        Engine.prevInputState.has(key) &&
        value.type !== InputType.BUTTON &&
        value.lifecycleState !== LifecycleValue.ENDED
      ) {
        value.lifecycleState =
          JSON.stringify(value.value) === JSON.stringify(Engine.prevInputState.get(key).value)
            ? LifecycleValue.UNCHANGED
            : LifecycleValue.CHANGED
      }
    })

    // copy client input state to input component
    for (const entity of localClientInputQuery(world)) {
      const inputComponent = getComponent(entity, InputComponent)
      inputComponent.data.clear()
      Engine.inputState.forEach((value: InputValue, key: InputAlias) => {
        if (inputComponent.schema.inputMap.has(key)) {
          inputComponent.data.set(inputComponent.schema.inputMap.get(key), JSON.parse(JSON.stringify(value)))
        }
      })

      inputComponent.data.forEach((value: InputValue, key: InputAlias) => {
        if (inputComponent.schema.behaviorMap.has(key)) {
          inputComponent.schema.behaviorMap.get(key)(entity, key, value, delta)
        }
      })
    }

    // if button input has ended, remove it
    Engine.inputState.forEach((value: InputValue, key: InputAlias) => {
      if (Engine.prevInputState.get(key)?.lifecycleState === LifecycleValue.ENDED) {
        Engine.inputState.delete(key)
        return
      }
    })

    return world
  })
}
