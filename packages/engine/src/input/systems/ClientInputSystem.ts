import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { InputComponent, InputComponentType } from '../components/InputComponent'
import { LocalInputTagComponent } from '../components/LocalInputTagComponent'
import { InputType } from '../enums/InputType'
import { addClientInputListeners } from '../functions/clientInputListeners'
import { handleGamepads } from '../functions/GamepadInput'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'

export const processEngineInputState = () => {
  // for continuous input, figure out if the current data and previous data is the same
  Engine.instance.inputState.forEach((value: InputValue, key: InputAlias) => {
    if (Engine.instance.prevInputState.has(key)) {
      if (value.type === InputType.BUTTON) {
        if (
          value.lifecycleState === LifecycleValue.Started &&
          Engine.instance.prevInputState.get(key)?.lifecycleState === LifecycleValue.Started
        ) {
          value.lifecycleState = LifecycleValue.Continued
        }
      } else {
        if (value.lifecycleState !== LifecycleValue.Ended) {
          value.lifecycleState =
            JSON.stringify(value.value) === JSON.stringify(Engine.instance.prevInputState.get(key)?.value)
              ? LifecycleValue.Unchanged
              : LifecycleValue.Changed
        }
      }

      if (
        Engine.instance.prevInputState.get(key)?.lifecycleState === LifecycleValue.Ended &&
        value.lifecycleState === LifecycleValue.Ended
      ) {
        Engine.instance.inputState.delete(key)
      }
    }
  })

  Engine.instance.prevInputState.clear()
  Engine.instance.inputState.forEach((value: InputValue, key: InputAlias) => {
    Engine.instance.prevInputState.set(key, value)
  })
}

export const processCombinationLifecycle = (
  inputComponent: InputComponentType,
  prevData: Map<InputAlias, InputValue>,
  mapping: InputAlias,
  input: InputAlias[]
) => {
  const prev = prevData.get(mapping)
  const isActive = input.map((c) => Engine.instance.inputState.has(c)).filter((a) => !a).length === 0
  const wasActive = prev?.lifecycleState === LifecycleValue.Started || prev?.lifecycleState === LifecycleValue.Continued

  if (isActive) {
    if (prev?.lifecycleState === LifecycleValue.Ended)
      // if we previously have ended this combination start it again or ignore it
      inputComponent.data.set(mapping, {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Started
      })
    else if (wasActive)
      // if this combination was previously active and still is, continue it
      inputComponent.data.set(mapping, {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Continued
      })
    // if this combination was not previously active but now is, start it
    else
      inputComponent.data.set(mapping, {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Started
      })
  } else {
    // if this combination was previously active but no longer, end it
    if (wasActive)
      inputComponent.data.set(mapping, {
        type: InputType.BUTTON,
        value: [BinaryValue.OFF],
        lifecycleState: LifecycleValue.Ended
      })
  }
}

export const processInputComponentData = (entity: Entity) => {
  const inputComponent = getComponent(entity, InputComponent)

  const prevData = new Map<InputAlias, InputValue>()
  inputComponent.data.forEach((value: InputValue, key: InputAlias) => {
    prevData.set(key, value)
  })
  inputComponent.data.clear()

  // apply the input mappings
  for (const [input, mapping] of inputComponent.schema.inputMap) {
    if (typeof input === 'object') {
      processCombinationLifecycle(inputComponent, prevData, mapping, input)
    } else {
      if (Engine.instance.inputState.has(input))
        inputComponent.data.set(mapping, JSON.parse(JSON.stringify(Engine.instance.inputState.get(input))))
    }
  }

  // now that we have the data mapped, run the behaviors
  inputComponent.data.forEach((value: InputValue, key: InputAlias) => {
    if (inputComponent.schema.behaviorMap.has(key)) {
      inputComponent.schema.behaviorMap.get(key)!(entity, key, value)
    }
  })
}

export default async function ClientInputSystem(world: World) {
  const localClientInputQuery = defineQuery([InputComponent, LocalInputTagComponent])

  addClientInputListeners()

  return () => {
    if (!EngineRenderer.instance?.xrSession) {
      handleGamepads()
    }

    processEngineInputState()

    // copy client input state to input component
    for (const entity of localClientInputQuery(world)) {
      processInputComponentData(entity)
    }
  }
}
