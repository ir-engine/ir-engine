import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { InputComponent } from '../components/InputComponent'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'

export const processInput = (entity, delta) => {
  const input = getComponent(entity, InputComponent)

  // key is the input type enu, value is the input value
  Engine.inputState.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    if (input.schema.inputMap.has(key)) {
      value.inputAction = key
      input.data.set(input.schema.inputMap.get(key), value)
    }
  })

  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    if (!input.prevData.has(key)) {
      return
    }

    if (value.type === InputType.BUTTON) {
      const prevValue = input.prevData.get(key)
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
      JSON.stringify(value.value) === JSON.stringify(input.prevData.get(key).value)
        ? LifecycleValue.UNCHANGED
        : LifecycleValue.CHANGED
  })

  // call input behaviors
  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    if (input.schema.behaviorMap.has(key)) {
      input.schema.behaviorMap.get(key)(entity, key, value, delta)
    }
  })

  // handleInput(entity, delta)

  // store prevData
  input.prevData.clear()
  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    input.prevData.set(key, value)
  })

  // Add all values in input component to schema
  input.data.forEach((value: any, key) => {
    if (value.type === InputType.BUTTON)
      Network.instance.clientInputState.buttons.push({
        input: key,
        value: value.value,
        lifecycleState: value.lifecycleState
      })
    else if (value.type === InputType.ONEDIM)
      Network.instance.clientInputState.axes1d.push({
        input: key,
        value: value.value,
        lifecycleState: value.lifecycleState
      })
    else if (value.type === InputType.TWODIM)
      Network.instance.clientInputState.axes2d.push({
        input: key,
        value: value.value,
        lifecycleState: value.lifecycleState
      })
    else if (value.type === InputType.SIXDOF)
      Network.instance.clientInputState.axes6DOF.push({ input: key, value: value.value })
  })

  const avatar = getComponent(entity, AvatarComponent)
  if (avatar) {
    Network.instance.clientInputState.viewVector.x = avatar.viewVector.x
    Network.instance.clientInputState.viewVector.y = avatar.viewVector.y
    Network.instance.clientInputState.viewVector.z = avatar.viewVector.z
  }

  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    if (value.type === InputType.BUTTON) {
      if (value.lifecycleState === LifecycleValue.ENDED) {
        input.data.delete(key)
      }
    }
  })
}
