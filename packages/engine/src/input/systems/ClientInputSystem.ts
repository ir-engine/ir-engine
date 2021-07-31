import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { System } from '../../ecs/classes/System'
import { Not } from '../../ecs/functions/ComponentFunctions'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { NetworkObject } from '../../networking/components/NetworkObject'
import { Input } from '../components/Input'
import { LocalInputReceiver } from '../components/LocalInputReceiver'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { WEBCAM_INPUT_EVENTS } from '../constants/InputConstants'
import { Engine } from '../../ecs/classes/Engine'
import { processInput } from '../functions/processInput'
import { handleGamepads } from '../behaviors/GamepadInputBehaviors'

const isBrowser = new Function('try {return this===window;}catch(e){ return false;}')

let faceToInput, lipToInput

if (isBrowser())
  import('../behaviors/WebcamInputBehaviors').then((imported) => {
    faceToInput = imported.faceToInput
    lipToInput = imported.lipToInput
  })

/**
 * Input System
 *
 * Property with prefix readonly makes a property as read-only in the class
 * @property {Number} mainControllerId set value 0
 * @property {Number} secondControllerId set value 1
 */

export class ClientInputSystem extends System {
  static EVENTS = {
    ENABLE_INPUT: 'CLIENT_INPUT_SYSTEM_ENABLE_INPUT',
    PROCESS_INPUT: 'CLIENT_INPUT_SYSTEM_PROCESS_EVENT'
  }

  static instance: ClientInputSystem

  mouseInputEnabled = true
  keyboardInputEnabled = true

  constructor() {
    super()

    ClientInputSystem.instance = this

    EngineEvents.instance.addEventListener(WEBCAM_INPUT_EVENTS.FACE_INPUT, ({ detection }) => {
      faceToInput(Network.instance.localClientEntity, detection)
    })

    EngineEvents.instance.addEventListener(WEBCAM_INPUT_EVENTS.LIP_INPUT, ({ pucker, widen, open }) => {
      lipToInput(Network.instance.localClientEntity, pucker, widen, open)
    })

    EngineEvents.instance.addEventListener(ClientInputSystem.EVENTS.ENABLE_INPUT, ({ keyboard, mouse }) => {
      if (typeof keyboard !== 'undefined') ClientInputSystem.instance.keyboardInputEnabled = keyboard
      if (typeof mouse !== 'undefined') ClientInputSystem.instance.mouseInputEnabled = mouse
    })
  }

  dispose(): void {
    EngineEvents.instance.removeAllListenersForEvent(ClientInputSystem.EVENTS.ENABLE_INPUT)
    EngineEvents.instance.removeAllListenersForEvent(WEBCAM_INPUT_EVENTS.FACE_INPUT)
    EngineEvents.instance.removeAllListenersForEvent(WEBCAM_INPUT_EVENTS.LIP_INPUT)
    EngineEvents.instance.removeAllListenersForEvent(ClientInputSystem.EVENTS.PROCESS_INPUT)
  }

  /**
   *
   * @param {Number} delta Time since last frame
   */

  public execute(delta: number): void {
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
    networkClientInput: {
      components: [NetworkObject, Input, Not(LocalInputReceiver)],
      listen: {
        added: true,
        removed: true
      }
    },
    localClientInput: {
      components: [Input, LocalInputReceiver],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
