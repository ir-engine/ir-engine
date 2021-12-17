import assert, { strictEqual } from 'assert'
import { Engine } from '../../ecs/classes/Engine'
import { GamepadAxis } from '../enums/InputEnums'
import { handleKey, handleMouseButton, handleMouseMovement, handleMouseWheel, handleTouch, handleTouchDirectionalPad, handleTouchGamepadButton, handleTouchMove, usingThumbstick } from './ClientInputSchema'

describe('clientInputSchema', () => {
    
    it('check useThumpstick', () => {
        strictEqual(usingThumbstick(), false)
    })

    it('check handleTouchMove', () => {
        const touchEvent = { type: 'touchstart', 
                        touches: [{ 
                        force: 1, 
                        clientX: 0, 
                        clientY: 0, 
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

        assert(Engine.inputState.size > 0)
        Engine.inputState.clear()
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