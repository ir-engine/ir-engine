/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import {
  PresentationSystemGroup,
  SystemDefinitions,
  SystemUUID,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { applyIncomingActions, dispatchAction } from '@ir-engine/hyperflux'
import { InputSourceComponent } from '../input/components/InputSourceComponent'
import { XRHapticsSystem } from './XRHapticsSystem'
import { XRAction } from './XRState'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRHapticsSystem', () => {
  const System = SystemDefinitions.get(XRHapticsSystem)!
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEmulatedXREngine()
    destroyEngine()
  })

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.XRHapticsSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRHapticsSystem).toBe('ee.engine.XRHapticsSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.after).not.toBe(undefined)
      expect(System.insert!.after!).toBe(PresentationSystemGroup)
    })
  }) //:: Fields

  describe('execute,', () => {
    describe('for every action in the XRAction.vibrateController action queue ..', () => {
      describe('for every entity that has an InputSourceComponent ..', () => {
        it('should not do anything for this action+entity pair if entity.InputSourceComponent.source.gamepad is falsy', () => {
          // Set the data as expected
          const resultSpy = vi.fn()
          const gamepad = { vibrationActuator: { playEffect: resultSpy as any } as GamepadHapticActuator } as Gamepad
          const source = { handedness: 'left', gamepad: undefined } as XRInputSource
          setComponent(testEntity, InputSourceComponent, { gamepad: gamepad, source: source })
          System.execute() // Must run once before everything. Otherwise the queue won't exist yet
          dispatchAction(XRAction.vibrateController({ handedness: 'left', value: 0.42, duration: 123 }))
          // Sanity check before running
          expect(getComponent(testEntity, InputSourceComponent).source.gamepad).toBeFalsy()
          expect(resultSpy).not.toHaveBeenCalled()
          // Run and Check the result
          applyIncomingActions()
          System.execute()
          expect(resultSpy).not.toHaveBeenCalled()
        })

        it('should not do anything for this action+entity pair if entity.InputSourceComponent.source.handedness is not action.handedness', () => {
          // Set the data as expected
          const sourceHandedness = 'left' as XRHandedness
          const actionHandedness = 'right' as XRHandedness
          const resultSpy = vi.fn()
          const gamepad = { vibrationActuator: { playEffect: resultSpy as any } as GamepadHapticActuator } as Gamepad
          const source = { handedness: sourceHandedness, gamepad: gamepad } as XRInputSource
          setComponent(testEntity, InputSourceComponent, { gamepad: gamepad, source: source })
          System.execute() // Must run once before everything. Otherwise the queue won't exist yet
          dispatchAction(
            XRAction.vibrateController({ handedness: actionHandedness as any, value: 0.42, duration: 123 })
          )
          // Sanity check before running
          expect(getComponent(testEntity, InputSourceComponent).source.gamepad).toBeTruthy()
          expect(getComponent(testEntity, InputSourceComponent).source.handedness).not.toBe(actionHandedness)
          expect(resultSpy).not.toHaveBeenCalled()
          // Run and Check the result
          applyIncomingActions()
          System.execute()
          expect(resultSpy).not.toHaveBeenCalled()
        })

        describe("when entity.InputSourceComponent.source.gamepad has a 'hapticActuators' field ..", () => {
          it('.. should call entity.InputSourceComponent.source.gamepad.hapticActuators[0].pulse with (action.value, action.duration)', async () => {
            // Set the data as expected
            const resultSpy = vi.fn()
            const gamepad = { hapticActuators: [{ pulse: resultSpy }] as any[] } as unknown as Gamepad
            const source = { handedness: 'left', gamepad: gamepad } as XRInputSource
            setComponent(testEntity, InputSourceComponent, { source: source })
            System.execute() // Must run once before everything. Otherwise the queue won't exist yet
            dispatchAction(XRAction.vibrateController({ handedness: 'left', value: 0.42, duration: 123 }))
            // Sanity check before running
            expect(resultSpy).not.toHaveBeenCalled()
            // Run and Check the result
            applyIncomingActions()
            System.execute()
            expect(resultSpy).toHaveBeenCalled()
          })

          it('.. should not do anything else for this action+entity pair  (continue)', () => {
            // Set the data as expected
            const resultSpy1 = vi.fn()
            const resultSpy2 = vi.fn()
            const gamepad = {
              hapticActuators: [{ pulse: resultSpy1 }] as any[],
              vibrationActuator: { playEffect: resultSpy2 as any }
            } as unknown as Gamepad
            const source = { handedness: 'left', gamepad: gamepad } as XRInputSource
            setComponent(testEntity, InputSourceComponent, { gamepad: gamepad, source: source })
            System.execute() // Must run once before everything. Otherwise the queue won't exist yet
            dispatchAction(XRAction.vibrateController({ handedness: 'left', value: 0.42, duration: 123 }))
            // Sanity check before running
            expect(resultSpy1).not.toHaveBeenCalled()
            const vibrationActuator = getComponent(testEntity, InputSourceComponent).source.gamepad!.vibrationActuator!
            expect(vibrationActuator).toBeTruthy()
            // Run and Check the result
            applyIncomingActions()
            System.execute()
            expect(resultSpy1).toHaveBeenCalled()
            expect(resultSpy2).not.toHaveBeenCalled()
          })
        })

        it("should call entity.InputSourceComponent.source.gamepad.vibrationActuator.playEffect with ('dual-rumble', action.duration) if vibrationActuator is truthy", () => {
          // Set the data as expected
          const resultSpy = vi.fn()
          const gamepad = { vibrationActuator: { playEffect: resultSpy as any } as GamepadHapticActuator } as Gamepad
          const source = { handedness: 'left', gamepad: gamepad } as XRInputSource
          setComponent(testEntity, InputSourceComponent, { gamepad: gamepad, source: source })
          System.execute() // Must run once before everything. Otherwise the queue won't exist yet
          dispatchAction(XRAction.vibrateController({ handedness: 'left', value: 0.42, duration: 123 }))
          // Sanity check before running
          expect(resultSpy).not.toHaveBeenCalled()
          const vibrationActuator = getComponent(testEntity, InputSourceComponent).source.gamepad!.vibrationActuator!
          expect(vibrationActuator).toBeTruthy()
          // Run and Check the result
          applyIncomingActions()
          System.execute()
          expect(resultSpy).toHaveBeenCalledTimes(1)
        })

        it('should not do anything else for this action+entity pair (continue) if entity.InputSourceComponent.source.gamepad.vibrationActuator is falsy', () => {
          // Set the data as expected
          const resultSpy = vi.fn()
          const gamepad = { vibrationActuator: null } as Gamepad
          const source = { handedness: 'left', gamepad: gamepad } as XRInputSource
          setComponent(testEntity, InputSourceComponent, { gamepad: gamepad, source: source })
          System.execute() // Must run once before everything. Otherwise the queue won't exist yet
          dispatchAction(XRAction.vibrateController({ handedness: 'left', value: 0.42, duration: 123 }))
          // Sanity check before running
          expect(resultSpy).not.toHaveBeenCalled()
          const vibrationActuator = getComponent(testEntity, InputSourceComponent).source.gamepad!.vibrationActuator!
          expect(vibrationActuator).toBeFalsy()
          // Run and Check the result
          applyIncomingActions()
          System.execute()
          expect(resultSpy).not.toHaveBeenCalled()
        })
      })
    })
  }) //:: execute
}) //:: XRHapticsSystem
