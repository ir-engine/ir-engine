import assert, { strictEqual } from 'assert'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { Engine } from '../../ecs/classes/Engine'
import { GamepadAxis, GamepadButtons, MouseInput, TouchInputs } from '../enums/InputEnums'
import { handleKey, handleMouseButton, handleMouseMovement, handleTouch, handleTouchDirectionalPad, handleTouchGamepadButton, handleTouchMove, normalizeMouseCoordinates, prevTouchPosition, usingThumbstick } from './ClientInputSchema'
import '../../patchEngineNode'
import '../../../tests/util/patchBrowserForNode'

describe('clientInputSchema', () => {
    
    beforeEach(() => {
        Engine.inputState.clear()
    })

    it('check useThumpstick', () => {
        strictEqual(usingThumbstick(), false)
    })

    it('check handleTouchMove', () => {
            const newClientX = 1
            const newClientY = 1

            const normalized = normalizeMouseCoordinates(newClientX, newClientY, window.innerWidth, window.innerHeight)
            const rNorm: [number, number] = [normalized.x, normalized.y]

            const touchEvent = { type: 'touchstart', 
                            touches: [{ 
                            force: 1, 
                            clientX: newClientX, 
                            clientY: newClientY, 
                            identifier: 0, 
                            radiusX: 0, 
                            radiusY: 0, 
                            pageX: 0, 
                            pageY: 0, 
                            rotationAngle: 60, 
                            screenX: 0, 
                            screenY: 0, 
                            target: new EventTarget() }] }

            handleTouchMove(touchEvent as unknown as TouchEvent)
            strictEqual(prevTouchPosition[0], rNorm[0])
            strictEqual(prevTouchPosition[1], rNorm[1])
            strictEqual(Engine.inputState.get(TouchInputs.Touch1Position)?.lifecycleState, LifecycleValue.Started)

            const touchEvent2 = { type: 'touchchange', 
                            touches: [{ 
                            force: 1, 
                            clientX: newClientX, 
                            clientY: newClientY, 
                            identifier: 0, 
                            radiusX: 0, 
                            radiusY: 0, 
                            pageX: 0, 
                            pageY: 0, 
                            rotationAngle: 60, 
                            screenX: 0, 
                            screenY: 0, 
                            target: new EventTarget() }] }

            handleTouchMove(touchEvent2 as unknown as TouchEvent)
            
            strictEqual(Engine.inputState.get(TouchInputs.Touch1Position)?.lifecycleState, LifecycleValue.Changed)

            assert(Engine.inputState.size > 0)
    })

    it('check handleTouch', async () => {
        const touchEvent = { type: 'touchstart', 
                        targetTouches: [
                            '1'
                        ]}

        handleTouch(touchEvent as unknown as TouchEvent)
        assert(Engine.inputState.get(TouchInputs.Touch)?.lifecycleState === LifecycleValue.Started)
        assert(Engine.inputState.get(TouchInputs.DoubleTouch) === undefined)
        //double tap
        handleTouch(touchEvent as unknown as TouchEvent)
        assert(Engine.inputState.get(TouchInputs.DoubleTouch)?.lifecycleState === LifecycleValue.Started)
        assert(Engine.inputState.get(TouchInputs.Touch)?.lifecycleState === LifecycleValue.Continued)
        
        const touchEvent2 = { type: 'touchend', 
                        targetTouches: [
                            '1'
                        ]}
        handleTouch(touchEvent2 as unknown as TouchEvent)
        assert(Engine.inputState.get(TouchInputs.Touch)?.lifecycleState === LifecycleValue.Ended)

        assert(Engine.inputState.size > 0)
    })

    it('check handleTouchDirectionalPad', () => {
        let touchEvent = { 
            detail: {
                stick: GamepadAxis.Left,
                value: {
                    x: 1,
                    y: 1,
                    angleRad: 2
                }
            }
        }

        const input = GamepadAxis.Left

        handleTouchDirectionalPad(touchEvent as unknown as CustomEvent)
        assert(Engine.inputState.get(input)?.lifecycleState === LifecycleValue.Started)
        handleTouchDirectionalPad(touchEvent as unknown as CustomEvent)
        assert(Engine.inputState.get(input)?.lifecycleState === LifecycleValue.Started)
        touchEvent = { 
            detail: {
                stick: GamepadAxis.Left,
                value: {
                    x: 4,
                    y: 4,
                    angleRad: 5
                }
            }
        }
        handleTouchDirectionalPad(touchEvent as unknown as CustomEvent)
        assert(Engine.inputState.get(input)?.lifecycleState === LifecycleValue.Changed)

        assert(Engine.inputState.size > 0)
    })

    it('check handleTouchGamepadButton', () => {
        let touchEvent = { 
            type: 'touchgamepadbuttondown',
            detail: { 
                button: GamepadButtons.A
            }
        }

        handleTouchGamepadButton(touchEvent as unknown as CustomEvent)
        assert(Engine.inputState.get(GamepadButtons.A)?.lifecycleState === LifecycleValue.Started)

        handleTouchGamepadButton(touchEvent as unknown as CustomEvent)
        assert(Engine.inputState.get(GamepadButtons.A)?.lifecycleState === LifecycleValue.Continued)
        touchEvent = { 
            type: 'touchgamepadbuttonup',
            detail: { 
                button: GamepadButtons.A
            }
        }
        handleTouchGamepadButton(touchEvent as unknown as CustomEvent)
        assert(Engine.inputState.get(GamepadButtons.A)?.lifecycleState === LifecycleValue.Ended)
        assert(Engine.inputState.size > 0)
    })

    it('check handleMouseMovement', () => {
        const touchEvent = { 
            clientX: 0,
            clientY: 0
        }

        Engine.mouseInputEnabled = false
        handleMouseMovement(touchEvent as unknown as MouseEvent)
        assert(Engine.inputState.size === 0)
        Engine.mouseInputEnabled = true
        handleMouseMovement(touchEvent as unknown as MouseEvent)
        assert(Engine.inputState.get(MouseInput.MousePosition)?.lifecycleState === LifecycleValue.Started)
        assert(Engine.inputState.get(MouseInput.MouseMovement)?.lifecycleState === LifecycleValue.Started)
        handleMouseMovement(touchEvent as unknown as MouseEvent)
        assert(Engine.inputState.get(MouseInput.MousePosition)?.lifecycleState === LifecycleValue.Changed)
        assert(Engine.inputState.get(MouseInput.MouseMovement)?.lifecycleState === LifecycleValue.Changed)
        
        assert(Engine.inputState.size > 0)
    })

    it('check handleMouseButton', () => {
        let touchEvent = { 
            type: 'mousedown',
            button: MouseInput.LeftButton,
            clientX: 0,
            clientY: 0
        }

        Engine.mouseInputEnabled = false
        handleMouseButton(touchEvent as unknown as MouseEvent)
        assert(Engine.inputState.size === 0)
        Engine.mouseInputEnabled = true
        handleMouseButton(touchEvent as unknown as MouseEvent)
        assert(Engine.inputState.get(MouseInput.MouseClickDownPosition)?.lifecycleState === LifecycleValue.Started)
        assert(Engine.inputState.get(MouseInput.LeftButton)?.lifecycleState === LifecycleValue.Started)
        
        touchEvent = { 
            type: 'mouseup',
            button: MouseInput.LeftButton,
            clientX: 0,
            clientY: 0
        }
        handleMouseButton(touchEvent as unknown as MouseEvent)
        assert(Engine.inputState.get(MouseInput.MouseClickDownPosition)?.lifecycleState === LifecycleValue.Ended)
        assert(Engine.inputState.get(MouseInput.MouseClickDownPosition)?.lifecycleState === LifecycleValue.Ended)
        assert(Engine.inputState.get(MouseInput.LeftButton)?.lifecycleState === LifecycleValue.Ended)
        assert(Engine.inputState.get(MouseInput.MouseClickDownTransformRotation)?.lifecycleState === LifecycleValue.Ended)
        assert(Engine.inputState.get(MouseInput.MouseClickDownMovement)?.lifecycleState === LifecycleValue.Ended)
        assert(Engine.inputState.size > 0)
    })

    it('check handleKey', () => {
        let touchEvent = { 
            type: 'keydown',
            code: 'KeyA'
        }

        handleKey(touchEvent as unknown as KeyboardEvent)
        assert(Engine.inputState.get('KeyA')?.lifecycleState === LifecycleValue.Started)
        handleKey(touchEvent as unknown as KeyboardEvent)
        assert(Engine.inputState.get('KeyA')?.lifecycleState === LifecycleValue.Continued)
        touchEvent = { 
            type: 'keyup',
            code: 'KeyA'
        }
        handleKey(touchEvent as unknown as KeyboardEvent)
        assert(Engine.inputState.get('KeyA')?.lifecycleState === LifecycleValue.Ended)
        
        assert(Engine.inputState.size > 0)
    })
    
})