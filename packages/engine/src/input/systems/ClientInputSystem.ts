import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { InputComponent } from '../components/InputComponent'
import { LocalInputTagComponent } from '../components/LocalInputTagComponent'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'
import { Engine } from '../../ecs/classes/Engine'
import { handleGamepads } from '../functions/GamepadInput'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { Network } from '../../networking/classes/Network'
import { XR6DOF } from '../enums/InputEnums'

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

    // handle input lifecycle
    Engine.inputState.forEach((value: InputValue, key: InputAlias) => {
      // If no previous input, we don't need to clean anything
      if (!Engine.prevInputState.has(key)) {
        return
      }

      const prevValue = Engine.prevInputState.get(key)

      if (value.type === InputType.BUTTON) {
        // if button input is already pressed, set it to continued so we don't trigger multiple press events
        if (
          (prevValue.lifecycleState === LifecycleValue.STARTED && value.lifecycleState === LifecycleValue.STARTED) ||
          (prevValue.lifecycleState === LifecycleValue.CONTINUED && value.lifecycleState === LifecycleValue.STARTED)
        ) {
          value.lifecycleState = LifecycleValue.CONTINUED
        }
        return
      }

      if (value.lifecycleState === LifecycleValue.ENDED) {
        // ENDED here is a special case, like mouse position on mouse down
        return
      }

      // for continuous input, figure out if the current data and previous data is the same
      value.lifecycleState =
        JSON.stringify(value.value) === JSON.stringify(Engine.prevInputState.get(key).value)
          ? LifecycleValue.UNCHANGED
          : LifecycleValue.CHANGED
    })

    // Copy client input state to network
    Engine.inputState.forEach((value: InputValue, key: InputAlias) => {
      Network.instance.clientInputState.data.push({ key, value })
    })

    // copy client input state to input component
    for (const entity of localClientInputQuery(world)) {
      const input = getComponent(entity, InputComponent)
      input.prevData.clear()
      input.data.forEach((value: InputValue, key: InputAlias) => {
        input.prevData.set(key, value)
      })
      Engine.inputState.forEach((value: InputValue, key: InputAlias) => {
        if (input.schema.inputMap.has(key)) {
          input.data.set(input.schema.inputMap.get(key), JSON.parse(JSON.stringify(value)))
        }
      })
      input.data.forEach((value: InputValue, key: InputAlias) => {
        if (input.schema.behaviorMap.has(key)) {
          input.schema.behaviorMap.get(key)(entity, key, value, delta)
        }
      })
    }

    /**
     * handle input lifecycle
     */
    Engine.inputState.forEach((value: InputValue, key: InputAlias) => {
      /**
       * If no previous input, we don't need to clean anything
       */
      if (!Engine.prevInputState.has(key)) {
        return
      }

      const prevValue = Engine.prevInputState.get(key)

      /**
       * if button input is already ended, remove it
       */
      if (prevValue.lifecycleState === LifecycleValue.ENDED) {
        Engine.inputState.delete(key)
        return
      }
    })

    return world
  })
}
