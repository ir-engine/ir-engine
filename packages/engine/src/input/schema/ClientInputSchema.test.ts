import assert, { strictEqual } from 'assert'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { Engine } from '../../ecs/classes/Engine'
import { GamepadAxis, TouchInputs } from '../enums/InputEnums'
import { handleKey, handleMouseButton, handleMouseMovement, handleMouseWheel, handleTouch, handleTouchDirectionalPad, handleTouchGamepadButton, handleTouchMove, normalizeMouseCoordinates, prevTouchPosition, usingThumbstick } from './ClientInputSchema'

describe('clientInputSchema', () => {
    
    it('check useThumpstick', () => {
        strictEqual(usingThumbstick(), false)
    })

    describe('handleTouchMove', () => {
        it('touchstart', () => {
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
            Engine.inputState.clear()
        })
    })

    it('check handleTouch', () => {
        const touchEvent = { type: 'touchstart', 
                        targetTouches: [{
                            length: 1
                        }]}

        handleTouch(touchEvent as unknown as TouchEvent)

        assert(Engine.inputState.size > 0)
        Engine.inputState.clear()
    })

    it('check handleTouchDirectionalPad', () => {
        const touchEvent = { 
            detail: {
                stick: GamepadAxis.Left,
                value: {
                    x: 1,
                    y: 1,
                    angleRad: 2
                }
            }
        }

        handleTouchDirectionalPad(touchEvent as unknown as CustomEvent)

        assert(Engine.inputState.size > 0)
        Engine.inputState.clear()
    })

    it('check handleTouchGamepadButton', () => {
        const touchEvent = { 
            type: 'touchgamepadbuttondown',
            detail: {
                stick: GamepadAxis.Left,
                value: {
                    x: 1,
                    y: 1,
                    angleRad: 2
                }
            }
        }

        handleTouchGamepadButton(touchEvent as unknown as CustomEvent)

        assert(Engine.inputState.size > 0)
        Engine.inputState.clear()
    })

    it('check handleMouseMovement', () => {
        const touchEvent = { 
            clientX: 0,
            clientY: 0
        }

        handleMouseMovement(touchEvent as unknown as MouseEvent)

        assert(Engine.inputState.size > 0)
        Engine.inputState.clear()
    })

    it('check handleMouseButton', () => {
        const touchEvent = { 
            type: 'mousedown',
            button: 'left',
            clientX: 0,
            clientY: 0
        }

        handleMouseButton(touchEvent as unknown as MouseEvent)

        assert(Engine.inputState.size > 0)
        Engine.inputState.clear()
    })

    it('check handleKey', () => {
        const touchEvent = { 
            type: 'keydown',
            code: 'w'
        }

        handleKey(touchEvent as unknown as KeyboardEvent)

        assert(Engine.inputState.size > 0)
        Engine.inputState.clear()
    })
    
})