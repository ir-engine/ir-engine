import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { System } from '../../ecs/classes/System'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Input } from '../components/Input'
import { LocalInputReceiver } from '../components/LocalInputReceiver'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'
import { Engine } from '../../ecs/classes/Engine'
import { processInput } from '../functions/processInput'
import { handleGamepads } from '../behaviors/GamepadInputBehaviors'

export const enableInput = ({ keyboard, mouse }: { keyboard?: boolean; mouse?: boolean }) => {
  if (typeof keyboard !== 'undefined') Engine.keyboardInputEnabled = keyboard
  if (typeof mouse !== 'undefined') Engine.mouseInputEnabled = mouse
}

export class ClientInputSystem extends System {
  execute(delta: number): void {
    if (!Engine.xrSession) {
      handleGamepads()
    }

    Engine.inputState.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
      if (!Engine.prevInputState.has(key)) {
        return
      }

      if (value.type === InputType.BUTTON) {
        const prevValue = Engine.prevInputState.get(key)
        // auto ENDED when event not continue
        if (
          (prevValue.lifecycleState === LifecycleValue.STARTED && value.lifecycleState === LifecycleValue.STARTED) ||
          (prevValue.lifecycleState === LifecycleValue.CONTINUED && value.lifecycleState === LifecycleValue.STARTED)
        ) {
          // auto-switch to CONTINUED
          value.lifecycleState = LifecycleValue.CONTINUED
        }
        return
      }

      if (value.lifecycleState === LifecycleValue.ENDED) {
        // ENDED here is a special case, like mouse position on mouse down
        return
      }

      value.lifecycleState =
        JSON.stringify(value.value) === JSON.stringify(Engine.prevInputState.get(key).value)
          ? LifecycleValue.UNCHANGED
          : LifecycleValue.CHANGED
    })

    for (const entity of this.queryResults.localClientInput.all) {
      processInput(entity, delta)
    }

    Engine.prevInputState.clear()
    Engine.inputState.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
      Engine.prevInputState.set(key, value)
      if (value.lifecycleState === LifecycleValue.ENDED) {
        Engine.inputState.delete(key)
      }
    })

    // Called when input component is added to entity
    for (const entity of this.queryResults.localClientInput.added) {
      // Get component reference
      const input = getComponent(entity, Input)
      input.schema.onAdded(entity, delta)
    }

    // Called when input component is removed from entity
    for (const entity of this.queryResults.localClientInput.removed) {
      // Get component reference
      const input = getComponent(entity, Input, true)
      input.schema.onRemove(entity, delta)
    }
  }

  static queries = {
    localClientInput: {
      components: [Input, LocalInputReceiver],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
