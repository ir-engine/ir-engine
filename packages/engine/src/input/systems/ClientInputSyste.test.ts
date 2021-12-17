import { strictEqual } from 'assert'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { Engine } from '../../ecs/classes/Engine'
import { createWorld } from '../../ecs/classes/World'
import { GamepadAxis } from '../enums/InputEnums'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'
import { enableInput } from './ClientInputSystem'

describe('clientInputSystem', () => {
    
    it('check if enable input works', () => {
        enableInput({ keyboard: true, mouse: true })

        strictEqual(Engine.keyboardInputEnabled, true)
        strictEqual(Engine.mouseInputEnabled, true)
    })

    it('check the input life cycle', () => {
        const GAMEPAD_STICK = GamepadAxis.Left
        const stickPosition: NumericalType = [0, 0, 0]
        
        Engine.inputState.set(GAMEPAD_STICK, {
            type: InputType.TWODIM,
            value: stickPosition,
            lifecycleState: Engine.inputState.has(GAMEPAD_STICK) ? LifecycleValue.Started : LifecycleValue.Changed
          })
        
          strictEqual(Engine.inputState.size, 1)

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
          
        strictEqual(Engine.inputState.size, 1)
    })

    
})