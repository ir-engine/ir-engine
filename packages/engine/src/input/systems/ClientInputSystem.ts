import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { InputComponent, InputComponentType } from '../components/InputComponent'
import { LocalInputTagComponent } from '../components/LocalInputTagComponent'
import { BaseInput } from '../enums/BaseInput'
import { InputType } from '../enums/InputType'
import { addClientInputListeners, removeClientInputListeners } from '../functions/clientInputListeners'
import { handleGamepads } from '../functions/GamepadInput'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'

export const processEngineInputState = (world = Engine.instance.currentWorld) => {
  // for continuous input, figure out if the current data and previous data is the same
  for (const [key, value] of world.inputState) {
    const prevLifecycle = world.prevInputState.get(key)?.lifecycleState

    /**
     * If a button has previously started, set to unchanged (meaning held down)
     */
    if (value.type === InputType.BUTTON) {
      if (value.lifecycleState === LifecycleValue.Started && prevLifecycle === LifecycleValue.Started)
        value.lifecycleState = LifecycleValue.Unchanged
    } else {
      const isSameValue =
        world.prevInputState.get(key) && value.value.every((val, i) => val === world.prevInputState.get(key)!.value[i])
      const isZero = value.value.every((v) => v === 0)

      /**
       * Ignore axes started with 0 to avoid overriding multiple physics to virtual mapping
       */
      if (value.lifecycleState === LifecycleValue.Started && isZero) {
        value.lifecycleState = LifecycleValue.Ended
      }

      /**
       * If input lifecycle is not ended, figure out if it's changed or unchanged, and if it's zeroed and unchanged, end it
       */
      if (value.lifecycleState !== LifecycleValue.Ended) {
        if (isSameValue) {
          if (isZero) {
            value.lifecycleState = LifecycleValue.Ended
          } else {
            value.lifecycleState = LifecycleValue.Unchanged
          }
        } else {
          if (value.lifecycleState !== LifecycleValue.Started || world.prevInputState.has(key)) {
            value.lifecycleState = LifecycleValue.Changed
          }
        }
      }
    }

    /**
     * If current is ended, and previous is ended or doesnt exist, delete it (this is to both ignore unchanged and zeroed input, or cleanup ended lifecycle)
     */
    if ((!prevLifecycle || prevLifecycle === LifecycleValue.Ended) && value.lifecycleState === LifecycleValue.Ended)
      world.inputState.delete(key)
  }
}

export const processCombinationLifecycle = (
  inputComponent: InputComponentType,
  prevData: Map<InputAlias, InputValue>,
  mapping: InputAlias,
  input: InputAlias[]
) => {
  const prev = prevData.get(mapping)
  const isActive = input.map((c) => Engine.instance.currentWorld.inputState.has(c)).filter((a) => !a).length === 0
  const wasActive = prev?.lifecycleState === LifecycleValue.Started || prev?.lifecycleState === LifecycleValue.Unchanged

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
        lifecycleState: LifecycleValue.Unchanged
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
  for (const [key, value] of inputComponent.data) prevData.set(key, value)

  inputComponent.data.clear()

  // apply the input mappings
  for (const [input, mapping] of inputComponent.schema.inputMap) {
    if (typeof input === 'object') {
      processCombinationLifecycle(inputComponent, prevData, mapping, input)
    } else {
      if (Engine.instance.currentWorld.inputState.has(input)) {
        inputComponent.data.set(mapping, JSON.parse(JSON.stringify(Engine.instance.currentWorld.inputState.get(input))))
      }
    }
  }

  // now that we have the data mapped, run the behaviors
  for (const [key, value] of inputComponent.data) {
    if (inputComponent.schema.behaviorMap.has(key)) {
      inputComponent.schema.behaviorMap.get(key)!(entity, key, value)
    }
  }
}

export default async function ClientInputSystem(world: World) {
  const localClientInputQuery = defineQuery([InputComponent, LocalInputTagComponent])

  addClientInputListeners()
  world.pointerScreenRaycaster.layers.enableAll()

  const execute = () => {
    if (!EngineRenderer.instance?.xrSession) {
      handleGamepads()
    }

    processEngineInputState(world)

    // copy client input state to input component
    for (const entity of localClientInputQuery(world)) {
      processInputComponentData(entity)
    }

    // after running behaviours, update prev input with current input ready to receive new input
    world.prevInputState.clear()
    for (const [key, value] of world.inputState) {
      world.prevInputState.set(key, value)
    }

    const input = getComponent(world.localClientEntity, InputComponent)
    const screenXY = input?.data?.get(BaseInput.SCREENXY)?.value

    if (screenXY) {
      world.pointerScreenRaycaster.setFromCamera({ x: screenXY[0], y: screenXY[1] }, world.camera)
    } else {
      world.pointerScreenRaycaster.ray.origin.set(Infinity, Infinity, Infinity)
      world.pointerScreenRaycaster.ray.direction.set(0, -1, 0)
    }
  }

  const cleanup = async () => {
    removeClientInputListeners()
    removeQuery(world, localClientInputQuery)
  }

  return { execute, cleanup }
}
