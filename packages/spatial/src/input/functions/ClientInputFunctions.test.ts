/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  createEngine,
  createEntity,
  destroyEngine,
  Entity,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import assert from 'assert'
import sinon from 'sinon'
import { Quaternion, Vector2, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertVec } from '../../../tests/util/assert'
import { Q_IDENTITY, Vector3_Zero } from '../../common/constants/MathConstants'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import { ButtonState, ButtonStateMap, MouseButton } from '../state/ButtonState'
import ClientInputFunctions, { DRAGGING_THRESHOLD, ROTATING_THRESHOLD } from './ClientInputFunctions'

describe('ClientInputFunctions', () => {
  describe('preventDefault', () => {
    it('should call the preventDefault function of the given object/event', () => {
      const eventSpy = sinon.spy()
      const Event = { preventDefault: eventSpy }
      assert.ok(!eventSpy.called)
      ClientInputFunctions.preventDefault(Event)
      assert.ok(eventSpy.called)
    })
  })

  describe('preventDefaultKeyDown', () => {
    let mockDocumentPrev: Document
    let mockInput: Document
    let mockTextArea: Document

    beforeEach(() => {
      mockDocumentPrev = globalThis.document
      mockInput = {
        ...globalThis.document,
        activeElement: {
          ...globalThis.document.activeElement,
          tagName: 'INPUT'
        } as Element
      } as Document

      mockTextArea = {
        ...globalThis.document,
        activeElement: {
          ...globalThis.document.activeElement,
          tagName: 'TEXTAREA'
        } as Element
      } as Document
    })

    afterEach(() => {
      globalThis.document = mockDocumentPrev
    })

    it('should do nothing if document.activeElement.tagName is INPUT or TEXTAREA', () => {
      const eventSpy = sinon.spy()
      const Event = { preventDefault: eventSpy }
      assert.equal(eventSpy.called, false)
      globalThis.document = mockInput
      ClientInputFunctions.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, false)
      globalThis.document = mockTextArea
      ClientInputFunctions.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, false)
    })

    it('should call the preventDefault function of the event/object when its code property is Tab', () => {
      const eventSpy = sinon.spy()
      const Event = { preventDefault: eventSpy, code: 'Tab' }
      assert.equal(eventSpy.called, false)
      ClientInputFunctions.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, true)
    })

    it('should call the preventDefault function of the event/object when its code property is Space', () => {
      const eventSpy = sinon.spy()
      const Event = { preventDefault: eventSpy, code: 'Space' }
      assert.equal(eventSpy.called, false)
      ClientInputFunctions.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, true)
    })

    it('should call the preventDefault function of the event/object when its code property is Enter', () => {
      const eventSpy = sinon.spy()
      const Event = { preventDefault: eventSpy, code: 'Enter' }
      assert.equal(eventSpy.called, false)
      ClientInputFunctions.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, true)
    })

    it('should not call the preventDefault function of the event/object when its code property is an unexpected value', () => {
      const eventSpy = sinon.spy()
      const Event = { preventDefault: eventSpy, code: 'UnexpectedValue' }
      assert.equal(eventSpy.called, false)
      ClientInputFunctions.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, false)
    })
  })

  describe('setInputSources', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add the `@param inputSources` to the `InputComponent.inputSources` of each entity in the ancestor.InputComponent.inputSinks list', () => {
      const sourceOne = createEntity()
      const sourceTwo = createEntity()
      setComponent(sourceOne, InputSourceComponent)
      setComponent(sourceTwo, InputSourceComponent)
      const SourcesList = [sourceOne, sourceTwo] as Entity[]

      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })

      // Sanity check before running
      const before = getComponent(parentEntity, InputComponent).inputSources
      for (const source of SourcesList) {
        assert.equal(before.includes(source), false)
      }

      // Run the function and chech the result
      ClientInputFunctions.setInputSources(parentEntity, SourcesList)
      const result = getComponent(parentEntity, InputComponent).inputSources
      for (const source of SourcesList) {
        assert.equal(result.includes(source), true)
      }
    })
  })

  describe('cleanupButton', () => {
    type ButtonData = ButtonStateMap<Partial<Record<string | number | symbol, ButtonState | undefined>>>

    it("should make the button's .down property false when it is true", () => {
      const data = { key1: { down: true } as ButtonState } as ButtonData
      assert.equal(data.key1?.down, true)
      ClientInputFunctions.cleanupButton('key1', data, true)
      assert.equal(data.key1?.down, false)
    })

    it('should remove the button with the given `@param key` from the `@param buttons` list if `@param hasFocus` is false', () => {
      const data = { key1: { down: true } as ButtonState } as ButtonData
      assert.notEqual(data.key1, undefined)
      ClientInputFunctions.cleanupButton('key1', data, false)
      assert.equal(data.key1, undefined)
    })

    it('should remove the button with the given `@param key` from the `@param buttons` list if the button is up', () => {
      const data = { key1: { down: false, up: true } as ButtonState } as ButtonData
      assert.notEqual(data.key1, undefined)
      assert.equal(data.key1?.up, true)
      ClientInputFunctions.cleanupButton('key1', data, true)
      assert.equal(data.key1, undefined)
    })
  })

  describe('assignInputSources', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it("should add the `@param sourceEid` entity, and entities that have an InputSourceComponent but no TransformComponent, to the list of InputComponent.inputSources of sourceEid's parent, when capturedEntity is undefined", () => {
      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)

      const PointerID = 42
      const cameraEntity = createEntity()
      const capturedEntity = UndefinedEntity
      const sourceEntity = createEntity()
      setComponent(sourceEntity, TransformComponent)
      setComponent(sourceEntity, InputSourceComponent)
      setComponent(sourceEntity, InputPointerComponent, { pointerId: PointerID, cameraEntity: cameraEntity })
      setComponent(cameraEntity, EntityTreeComponent, { parentEntity: parentEntity })

      const otherEntity = createEntity()
      setComponent(otherEntity, InputSourceComponent)

      // Run and Check the result
      ClientInputFunctions.assignInputSources(sourceEntity, capturedEntity)
      const SourcesList = [sourceEntity, otherEntity]
      const result = getComponent(parentEntity, InputComponent).inputSources
      for (const entity of SourcesList) {
        assert.equal(result.includes(entity), true)
      }
    })

    it("should add the `@param sourceEid` entity, and entities that have an InputSourceComponent but no TransformComponent, to the list of InputComponent.inputSources of sourceEid's parent, when capturedEntity is a valid entity", () => {
      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)

      const PointerID = 42
      const cameraEntity = createEntity()
      const capturedEntity = createEntity()
      setComponent(capturedEntity, InputComponent)

      const sourceEntity = createEntity()
      setComponent(sourceEntity, TransformComponent)
      setComponent(sourceEntity, InputSourceComponent)
      setComponent(sourceEntity, InputPointerComponent, { pointerId: PointerID, cameraEntity: cameraEntity })
      setComponent(cameraEntity, EntityTreeComponent, { parentEntity: parentEntity })

      const otherEntity = createEntity()
      setComponent(otherEntity, InputSourceComponent)

      // Run and Check the result
      ClientInputFunctions.assignInputSources(sourceEntity, capturedEntity)
      const SourcesList = [sourceEntity, otherEntity]
      const result = getComponent(capturedEntity, InputComponent).inputSources
      for (const entity of SourcesList) {
        assert.equal(result.includes(entity), true)
      }
    })
  })

  describe('updatePointerDragging', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    describe('when the `@param pointerEntity` does not have an InputPointerComponent ...', () => {
      it('should not modify the dragging property of PrimaryClick when PrimaryClick.downPosition is (0,0,0)', () => {
        const Btn = MouseButton.PrimaryClick
        const ev = {} as PointerEvent

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState,
          [MouseButton.AuxiliaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState,
          [MouseButton.SecondaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState
        })

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, false)
      })

      it('should not modify the dragging property of AuxiliaryClick when AuxiliaryClick.downPosition is (0,0,0)', () => {
        const Btn = MouseButton.AuxiliaryClick
        const ev = { type: 'pointermove', button: 1 } as PointerEvent

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState,
          [MouseButton.AuxiliaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState,
          [MouseButton.SecondaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState
        })

        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)

        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, false)
      })

      it('should not modify the dragging property of SecondaryClick when SecondaryClick.downPosition is (0,0,0)', () => {
        const Btn = MouseButton.SecondaryClick
        const ev = { type: 'pointermove', button: 2 } as PointerEvent

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState,
          [MouseButton.AuxiliaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState,
          [MouseButton.SecondaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState
        })

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, false)
      })

      it('should modify the dragging property of PrimaryClick when PrimaryClick.downPosition is not (0,0,0)', () => {
        const Btn = MouseButton.PrimaryClick
        const ev = {} as PointerEvent

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.AuxiliaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.SecondaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState
        })

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, true)
      })

      it('should modify the dragging property of AuxiliaryClick when AuxiliaryClick.downPosition is not (0,0,0)', () => {
        const Btn = MouseButton.AuxiliaryClick
        const ev = { type: 'pointermove', button: 1 } as PointerEvent

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.AuxiliaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.SecondaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState
        })

        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)

        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, true)
      })

      it('should modify the dragging property of SecondaryClick when SecondaryClick.downPosition is not (0,0,0)', () => {
        const Btn = MouseButton.SecondaryClick
        const ev = { type: 'pointermove', button: 2 } as PointerEvent

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.AuxiliaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.SecondaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState
        })

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, true)
      })
    })

    describe('when the `@param pointerEntity` has an InputPointerComponent ...', () => {
      it('should modify the dragging property when the distance between PrimaryClick.downPosition and InputPointerComponent.position is greater than the threshold', () => {
        const Btn = MouseButton.PrimaryClick
        const ev = {} as PointerEvent

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        setComponent(pointerEntity, InputPointerComponent, { pointerId: 123, cameraEntity: UndefinedEntity })
        getMutableComponent(pointerEntity, InputPointerComponent).position.set(new Vector2(42, 42))

        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.AuxiliaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.SecondaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState
        })

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, true)
      })

      it('should not modify the dragging property when the distance between PrimaryClick.downPosition and InputPointerComponent.position is not greater than the threshold', () => {
        const Btn = MouseButton.PrimaryClick
        const ev = {} as PointerEvent

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        setComponent(pointerEntity, InputPointerComponent, { pointerId: 123, cameraEntity: UndefinedEntity })
        getMutableComponent(pointerEntity, InputPointerComponent).position.set(new Vector2(0, 0))

        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: {
            pressed: true,
            downPosition: new Vector3(0, 0, 0),
            dragging: false
          } as ButtonState,
          [MouseButton.AuxiliaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.SecondaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState
        })

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, false)
      })

      it('should not modify the dragging property of PrimaryClick when PrimaryClick.downPosition is (pointer.position.x, pointer.position.y, 0)', () => {
        const Btn = MouseButton.PrimaryClick
        const ev = {} as PointerEvent
        const Position = new Vector2(42, 42)
        const DownPosition = new Vector3(Position.x, Position.y, 0)

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: { pressed: true, downPosition: DownPosition, dragging: false } as ButtonState,
          [MouseButton.AuxiliaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState,
          [MouseButton.SecondaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState
        })
        setComponent(pointerEntity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })
        getMutableComponent(pointerEntity, InputPointerComponent).position.set(Position)

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, false)
      })

      it('should not modify the dragging property of AuxiliaryClick when AuxiliaryClick.downPosition is (pointer.position.x, pointer.position.y, 0)', () => {
        const Btn = MouseButton.AuxiliaryClick
        const ev = {} as PointerEvent
        const Position = new Vector2(42, 42)
        const DownPosition = new Vector3(Position.x, Position.y, 0)

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState,
          [MouseButton.AuxiliaryClick]: { pressed: true, downPosition: DownPosition, dragging: false } as ButtonState,
          [MouseButton.SecondaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState
        })
        setComponent(pointerEntity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })
        getMutableComponent(pointerEntity, InputPointerComponent).position.set(Position)

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, false)
      })

      it('should not modify the dragging property of SecondaryClick when SecondaryClick.downPosition is (pointer.position.x, pointer.position.y, 0)', () => {
        const Btn = MouseButton.SecondaryClick
        const ev = {} as PointerEvent
        const Position = new Vector2(42, 42)
        const DownPosition = new Vector3(Position.x, Position.y, 0)

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState,
          [MouseButton.AuxiliaryClick]: { pressed: true, downPosition: new Vector3(), dragging: false } as ButtonState,
          [MouseButton.SecondaryClick]: { pressed: true, downPosition: DownPosition, dragging: false } as ButtonState
        })
        setComponent(pointerEntity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })
        getMutableComponent(pointerEntity, InputPointerComponent).position.set(Position)

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, false)
      })

      it('should modify the dragging property of PrimaryClick when PrimaryClick.downPosition is not (pointer.position.x, pointer.position.y, 0)', () => {
        const Btn = MouseButton.PrimaryClick
        const ev = {} as PointerEvent
        const Position = new Vector2(42, 42)
        const DownPosition = new Vector3(1, 1, 0)

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        setComponent(pointerEntity, InputPointerComponent, { pointerId: 123, cameraEntity: UndefinedEntity })
        getMutableComponent(pointerEntity, InputPointerComponent).position.set(Position)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: {
            pressed: true,
            downPosition: DownPosition,
            dragging: false
          } as ButtonState,
          [MouseButton.AuxiliaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.SecondaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState
        })
        setComponent(pointerEntity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })
        getMutableComponent(pointerEntity, InputPointerComponent).position.set(Position)

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, true)
      })

      it('should modify the dragging property of AuxiliaryClick when AuxiliaryClick.downPosition is not (pointer.position.x, pointer.position.y, 0)', () => {
        const Btn = MouseButton.AuxiliaryClick
        const ev = { type: 'pointermove', button: 1 } as PointerEvent
        const Position = new Vector2(42, 42)
        const DownPosition = new Vector3(1, 1, 0)

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        setComponent(pointerEntity, InputPointerComponent, { pointerId: 123, cameraEntity: UndefinedEntity })
        getMutableComponent(pointerEntity, InputPointerComponent).position.set(Position)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.AuxiliaryClick]: {
            pressed: true,
            downPosition: DownPosition,
            dragging: false
          } as ButtonState,
          [MouseButton.SecondaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState
        })
        setComponent(pointerEntity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })
        getMutableComponent(pointerEntity, InputPointerComponent).position.set(Position)

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, true)
      })

      it('should modify the dragging property of SecondaryClick when SecondaryClick.downPosition is not (pointer.position.x, pointer.position.y, 0)', () => {
        const Btn = MouseButton.SecondaryClick
        const ev = { type: 'pointermove', button: 2 } as PointerEvent
        const Position = new Vector2(42, 42)
        const DownPosition = new Vector3(1, 1, 0)

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        setComponent(pointerEntity, InputPointerComponent, { pointerId: 123, cameraEntity: UndefinedEntity })
        getMutableComponent(pointerEntity, InputPointerComponent).position.set(Position)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [MouseButton.PrimaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.AuxiliaryClick]: {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState,
          [MouseButton.SecondaryClick]: {
            pressed: true,
            downPosition: DownPosition,
            dragging: false
          } as ButtonState
        })
        setComponent(pointerEntity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })
        getMutableComponent(pointerEntity, InputPointerComponent).position.set(Position)

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, true)
      })
    })
  })

  describe('updateGamepadInput', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputSourceComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    describe('when buttonState has a value, and either gamepadButton.pressed or gamepadButton.touched are true ...', () => {
      /** @note First Frame Cases */
      describe('when buttonState.pressed is false and gamepadButton.pressed is true (aka on the First Frame)...', () => {
        const ButtonStatePressed = false
        const GamepadButtonPressed = true

        it('... should set buttonState.down to true', () => {
          const Buttons = {}
          const GamepadButtons = [] as ButtonState[]

          // Set the initial data from the conditions
          const buttonState = {
            pressed: ButtonStatePressed,
            downPosition: new Vector3(1, 1, 1),
            dragging: false
          } as ButtonState
          const gamepadButton = { pressed: GamepadButtonPressed, touched: true, value: 42 } as ButtonState

          // Set the expected data
          const ID = 0
          Buttons[ID] = buttonState
          GamepadButtons[ID] = gamepadButton
          getMutableComponent(testEntity, InputSourceComponent).merge({
            buttons: Buttons,
            source: {
              gamepad: {
                buttons: GamepadButtons
              } as unknown as Gamepad
            } as XRInputSource
          })

          // Run and Check the result
          assert.equal(buttonState.down, undefined)
          ClientInputFunctions.updateGamepadInput(testEntity)
          assert.equal(buttonState.down, true)
        })

        describe('when `@param eid` has an InputPointerComponent ...', () => {
          it('... should set buttonState.downPosition to  InputPointerComponent.(position.x, position.y, 0)', () => {
            const Buttons = {}
            const GamepadButtons = [] as ButtonState[]

            // Set the initial data from the conditions
            const Initial = new Vector3(1, 1, 1)
            const Position = new Vector2(42, 42)
            const Expected = new Vector3(Position.x, Position.y, 0)
            const buttonState = {
              pressed: ButtonStatePressed,
              downPosition: Initial,
              dragging: false
            } as ButtonState
            const gamepadButton = { pressed: GamepadButtonPressed, touched: true, value: 42 } as ButtonState

            // Set the expected data
            const ID = 0
            Buttons[ID] = buttonState
            GamepadButtons[ID] = gamepadButton
            getMutableComponent(testEntity, InputSourceComponent).merge({
              buttons: Buttons,
              source: {
                gamepad: {
                  buttons: GamepadButtons
                } as unknown as Gamepad
              } as XRInputSource
            })
            setComponent(testEntity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })
            getMutableComponent(testEntity, InputPointerComponent).position.set(Position)

            // Run and Check the result
            assertVec.approxEq(buttonState.downPosition, Initial, 3)
            ClientInputFunctions.updateGamepadInput(testEntity)
            assertVec.approxEq(buttonState.downPosition, Expected, 3)
          })
        })

        describe('when `@param eid` has an XRSpaceComponent and a TransformComponent', () => {
          it('... should copy the `@param eid` TransformComponent.position into buttonState.downPosition', () => {
            const Buttons = {}
            const GamepadButtons = [] as ButtonState[]

            // Set the initial data from the conditions
            const Initial = new Vector3(1, 1, 1)
            const Expected = new Vector3(40, 41, 42)
            const buttonState = {
              pressed: ButtonStatePressed,
              downPosition: Initial,
              dragging: false
            } as ButtonState
            const gamepadButton = { pressed: GamepadButtonPressed, touched: true, value: 42 } as ButtonState

            // Set the expected data
            const ID = 0
            Buttons[ID] = buttonState
            GamepadButtons[ID] = gamepadButton
            getMutableComponent(testEntity, InputSourceComponent).merge({
              buttons: Buttons,
              source: {
                gamepad: {
                  buttons: GamepadButtons
                } as unknown as Gamepad
              } as XRInputSource
            })
            setComponent(testEntity, TransformComponent, { position: Expected })
            setComponent(testEntity, XRSpaceComponent, { space: {} as XRSpace, baseSpace: {} as XRSpace })

            // Run and Check the result
            assertVec.approxEq(buttonState.downPosition, Initial, 3)
            ClientInputFunctions.updateGamepadInput(testEntity)
            assertVec.approxEq(buttonState.downPosition, Expected, 3)
          })

          it('... should copy the `@param eid` TransformComponent.rotation into buttonState.downRotation', () => {
            const Buttons = {}
            const GamepadButtons = [] as ButtonState[]

            // Set the initial data from the conditions
            const Initial = new Quaternion(1, 1, 1).normalize()
            const Expected = new Quaternion(40, 41, 42).normalize()
            const buttonState = {
              pressed: ButtonStatePressed,
              downRotation: Initial,
              dragging: false
            } as ButtonState
            const gamepadButton = { pressed: GamepadButtonPressed, touched: true, value: 42 } as ButtonState

            // Set the expected data
            const ID = 0
            Buttons[ID] = buttonState
            GamepadButtons[ID] = gamepadButton
            getMutableComponent(testEntity, InputSourceComponent).merge({
              buttons: Buttons,
              source: {
                gamepad: {
                  buttons: GamepadButtons
                } as unknown as Gamepad
              } as XRInputSource
            })
            setComponent(testEntity, TransformComponent, { rotation: Expected })
            setComponent(testEntity, XRSpaceComponent, { space: {} as XRSpace, baseSpace: {} as XRSpace })

            // Run and Check the result
            assertVec.approxEq(buttonState.downRotation, Initial, 4)
            ClientInputFunctions.updateGamepadInput(testEntity)
            assertVec.approxEq(buttonState.downRotation, Expected, 4)
          })
        })

        describe('when `@param eid` has an InputPointerComponent and it does not have an XRSpaceComponent and a TransformComponent ...', () => {
          it('... should set buttonState.downPosition to a new Vector3()', () => {
            const Buttons = {}
            const GamepadButtons = [] as ButtonState[]

            // Set the initial data from the conditions
            const Initial = new Vector3(1, 1, 1)
            const Expected = new Vector3()
            const buttonState = {
              pressed: ButtonStatePressed,
              downPosition: Initial,
              dragging: false
            } as ButtonState
            const gamepadButton = { pressed: GamepadButtonPressed, touched: true, value: 42 } as ButtonState

            // Set the expected data
            const ID = 0
            Buttons[ID] = buttonState
            GamepadButtons[ID] = gamepadButton
            getMutableComponent(testEntity, InputSourceComponent).merge({
              buttons: Buttons,
              source: {
                gamepad: {
                  buttons: GamepadButtons
                } as unknown as Gamepad
              } as XRInputSource
            })
            setComponent(testEntity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })

            // Run and Check the result
            assertVec.approxEq(buttonState.downPosition, Initial, 3)
            ClientInputFunctions.updateGamepadInput(testEntity)
            assertVec.approxEq(buttonState.downPosition, Expected, 3)
          })

          it('... should set buttonState.downRotation to a new Quaterion()', () => {
            const Buttons = {}
            const GamepadButtons = [] as ButtonState[]

            // Set the initial data from the conditions
            const Initial = new Quaternion(42, 42, 42, 42).normalize()
            const Expected = new Quaternion()
            const buttonState = {
              pressed: ButtonStatePressed,
              downRotation: Initial,
              dragging: false
            } as ButtonState
            const gamepadButton = { pressed: GamepadButtonPressed, touched: true, value: 42 } as ButtonState

            // Set the expected data
            const ID = 0
            Buttons[ID] = buttonState
            GamepadButtons[ID] = gamepadButton
            getMutableComponent(testEntity, InputSourceComponent).merge({
              buttons: Buttons,
              source: {
                gamepad: {
                  buttons: GamepadButtons
                } as unknown as Gamepad
              } as XRInputSource
            })
            setComponent(testEntity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })

            // Run and Check the result
            assertVec.approxEq(buttonState.downRotation, Initial, 4)
            ClientInputFunctions.updateGamepadInput(testEntity)
            assertVec.approxEq(buttonState.downRotation, Expected, 4)
          })
        })
      })

      it('... should set buttonState.pressed to the value of gamepadButton.pressed', () => {
        const Buttons = {}
        const GamepadButtons = [] as ButtonState[]

        // Set the initial data from the conditions
        const GamepadButtonPressed = true
        const ButtonStatePressed = !GamepadButtonPressed
        const buttonState = {
          pressed: ButtonStatePressed,
          downPosition: new Vector3(1, 1, 1),
          dragging: false
        } as ButtonState
        const gamepadButton = { pressed: GamepadButtonPressed, touched: true, value: 42 } as ButtonState

        // Set the expected data
        const ID = 0
        Buttons[ID] = buttonState
        GamepadButtons[ID] = gamepadButton
        getMutableComponent(testEntity, InputSourceComponent).merge({
          buttons: Buttons,
          source: {
            gamepad: {
              buttons: GamepadButtons
            } as unknown as Gamepad
          } as XRInputSource
        })

        // Run and Check the result
        assert.notEqual(buttonState.pressed, GamepadButtonPressed)
        ClientInputFunctions.updateGamepadInput(testEntity)
        assert.equal(buttonState.pressed, GamepadButtonPressed)
      })

      it('... should set buttonState.touched to the value of gamepadButton.touched', () => {
        const Buttons = {}
        const GamepadButtons = [] as ButtonState[]

        // Set the initial data from the conditions
        const GamepadButtonTouched = true
        const ButtonStateTouched = !GamepadButtonTouched
        const buttonState = {
          touched: ButtonStateTouched,
          downPosition: new Vector3(1, 1, 1),
          dragging: false
        } as ButtonState
        const gamepadButton = { pressed: true, touched: GamepadButtonTouched, value: 42 } as ButtonState

        // Set the expected data
        const ID = 0
        Buttons[ID] = buttonState
        GamepadButtons[ID] = gamepadButton
        getMutableComponent(testEntity, InputSourceComponent).merge({
          buttons: Buttons,
          source: {
            gamepad: {
              buttons: GamepadButtons
            } as unknown as Gamepad
          } as XRInputSource
        })

        // Run and Check the result
        assert.notEqual(buttonState.touched, GamepadButtonTouched)
        ClientInputFunctions.updateGamepadInput(testEntity)
        assert.equal(buttonState.touched, GamepadButtonTouched)
      })

      it('... should set buttonState.value to the value of gamepadButton.value', () => {
        const Buttons = {}
        const GamepadButtons = [] as ButtonState[]

        // Set the initial data from the conditions
        const Initial = 1
        const Expected = 42
        const buttonState = {
          value: Initial,
          pressed: true,
          downPosition: new Vector3(1, 1, 1),
          dragging: true,
          rotating: true
        } as ButtonState
        const gamepadButton = { pressed: true, touched: true, value: Expected } as ButtonState

        // Set the expected data
        const ID = 0
        Buttons[ID] = buttonState
        GamepadButtons[ID] = gamepadButton
        getMutableComponent(testEntity, InputSourceComponent).merge({
          buttons: Buttons,
          source: {
            gamepad: {
              buttons: GamepadButtons
            } as unknown as Gamepad
          } as XRInputSource
        })

        // Run and Check the result
        assert.notEqual(buttonState.value, Expected)
        assert.equal(buttonState.value, Initial)
        ClientInputFunctions.updateGamepadInput(testEntity)
        assert.equal(buttonState.value, Expected)
      })

      describe('when buttonState.downPosition has a value ...', () => {
        it('... should set buttonState.dragging to true when it is not already true, `@param eid` has an InputPointerComponent and the distanceToSquared from buttonState.downPosition to InputPointerComponent.position is bigger than the threshold', () => {
          const Buttons = {}
          const GamepadButtons = [] as ButtonState[]

          // Set the initial data from the conditions
          const Initial = false
          const Expected = !Initial
          const buttonState = {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: Initial,
            rotating: true
          } as ButtonState
          const gamepadButton = { pressed: true, touched: true, value: 42 } as ButtonState

          // Set the expected data
          const ID = 0
          Buttons[ID] = buttonState
          GamepadButtons[ID] = gamepadButton
          getMutableComponent(testEntity, InputSourceComponent).merge({
            buttons: Buttons,
            source: {
              gamepad: {
                buttons: GamepadButtons
              } as unknown as Gamepad
            } as XRInputSource
          })
          setComponent(testEntity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })
          const pointerPosition = getMutableComponent(testEntity, InputPointerComponent).position
          pointerPosition.set(new Vector2(1, 1))
          const targetPosition = new Vector3(pointerPosition.value.x, pointerPosition.value.y, 0)
          const distance = buttonState.downPosition?.distanceToSquared(targetPosition)
          assert.equal(distance! > DRAGGING_THRESHOLD, true)

          // Run and Check the result
          assert.equal(hasComponent(testEntity, InputPointerComponent), true)
          assert.equal(buttonState.dragging, Initial)
          ClientInputFunctions.updateGamepadInput(testEntity)
          assert.equal(buttonState.dragging, Expected)
        })

        it('... should set buttonState.dragging to true when it is not already true, `@param eid` does not have an InputPointerComponent but has a TransformComponent, and the distanceToSquared from buttonState.downPosition to TransformComponent.position is bigger than the threshold', () => {
          const Buttons = {}
          const GamepadButtons = [] as ButtonState[]

          // Set the initial data from the conditions
          const Initial = false
          const Expected = !Initial
          const buttonState = {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: Initial,
            rotating: true
          } as ButtonState
          const gamepadButton = { pressed: true, touched: true, value: 42 } as ButtonState

          // Set the expected data
          const ID = 0
          Buttons[ID] = buttonState
          GamepadButtons[ID] = gamepadButton
          getMutableComponent(testEntity, InputSourceComponent).merge({
            buttons: Buttons,
            source: {
              gamepad: {
                buttons: GamepadButtons
              } as unknown as Gamepad
            } as XRInputSource
          })
          const targetPosition = new Vector3(42, 42, 42)
          setComponent(testEntity, TransformComponent, { position: targetPosition })
          const distance = buttonState.downPosition?.distanceToSquared(targetPosition)
          assert.equal(distance! > DRAGGING_THRESHOLD, true)

          // Run and Check the result
          assert.equal(hasComponent(testEntity, InputPointerComponent), false)
          assert.equal(hasComponent(testEntity, TransformComponent), true)
          assert.equal(buttonState.dragging, Initial)
          ClientInputFunctions.updateGamepadInput(testEntity)
          assert.equal(buttonState.dragging, Expected)
        })

        it('... should set buttonState.dragging to true when it is not already true, `@param eid` does not have an InputPointerComponent or a TransformComponent, and the distanceToSquared from buttonState.downPosition to Vector3_Zero is bigger than the threshold', () => {
          const Buttons = {}
          const GamepadButtons = [] as ButtonState[]

          // Set the initial data from the conditions
          const Initial = false
          const Expected = !Initial
          const buttonState = {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            dragging: Initial,
            rotating: true
          } as ButtonState
          const gamepadButton = { pressed: true, touched: true, value: 42 } as ButtonState

          // Set the expected data
          const ID = 0
          Buttons[ID] = buttonState
          GamepadButtons[ID] = gamepadButton
          getMutableComponent(testEntity, InputSourceComponent).merge({
            buttons: Buttons,
            source: {
              gamepad: {
                buttons: GamepadButtons
              } as unknown as Gamepad
            } as XRInputSource
          })
          const targetPosition = Vector3_Zero
          const distance = buttonState.downPosition?.distanceToSquared(targetPosition)
          assert.equal(distance! > DRAGGING_THRESHOLD, true)

          // Run and Check the result
          assert.equal(hasComponent(testEntity, InputPointerComponent), false)
          assert.equal(hasComponent(testEntity, TransformComponent), false)
          assert.equal(buttonState.dragging, Initial)
          ClientInputFunctions.updateGamepadInput(testEntity)
          assert.equal(buttonState.dragging, Expected)
        })

        it('... should set buttonState.rotating to true when it is not already true, `@param eid` has an InputPointerComponent and its rotation from Q_IDENTITY to buttonState.rotation is bigger than the threshold', () => {
          const Buttons = {}
          const GamepadButtons = [] as ButtonState[]

          // Set the initial data from the conditions
          const Initial = false
          const Expected = !Initial
          const buttonState = {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            downRotation: new Quaternion(42, 42, 42, 0).normalize(),
            dragging: true,
            rotating: Initial
          } as ButtonState
          const gamepadButton = { pressed: true, touched: true, value: 42 } as ButtonState

          // Set the expected data
          const ID = 0
          Buttons[ID] = buttonState
          GamepadButtons[ID] = gamepadButton
          getMutableComponent(testEntity, InputSourceComponent).merge({
            buttons: Buttons,
            source: {
              gamepad: {
                buttons: GamepadButtons
              } as unknown as Gamepad
            } as XRInputSource
          })
          setComponent(testEntity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })
          const targetRotation = Q_IDENTITY
          const distance = buttonState.downRotation?.angleTo(targetRotation)
          assert.equal(distance! > ROTATING_THRESHOLD, true)

          // Run and Check the result
          assert.equal(hasComponent(testEntity, InputPointerComponent), true)
          assert.equal(buttonState.rotating, Initial)
          ClientInputFunctions.updateGamepadInput(testEntity)
          assert.equal(buttonState.rotating, Expected)
        })

        it('... should set buttonState.rotating to true when it is not already true, `@param eid` does not have an InputPointerComponent but has a TransformComponent, and its rotation from TransformComponent.rotation to buttonState.rotation is bigger than the threshold', () => {
          const Buttons = {}
          const GamepadButtons = [] as ButtonState[]

          // Set the initial data from the conditions
          const Initial = false
          const Expected = !Initial
          const buttonState = {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            downRotation: new Quaternion(42, 42, 42, 0).normalize(),
            dragging: true,
            rotating: Initial
          } as ButtonState
          const gamepadButton = { pressed: true, touched: true, value: 42 } as ButtonState

          // Set the expected data
          const ID = 0
          Buttons[ID] = buttonState
          GamepadButtons[ID] = gamepadButton
          getMutableComponent(testEntity, InputSourceComponent).merge({
            buttons: Buttons,
            source: {
              gamepad: {
                buttons: GamepadButtons
              } as unknown as Gamepad
            } as XRInputSource
          })
          const targetRotation = new Quaternion(1, 1, 1, 1).normalize()
          setComponent(testEntity, TransformComponent, { rotation: targetRotation })
          const distance = buttonState.downRotation?.angleTo(targetRotation)
          assert.equal(distance! > ROTATING_THRESHOLD, true)

          // Run and Check the result
          assert.equal(hasComponent(testEntity, InputPointerComponent), false)
          assert.equal(hasComponent(testEntity, TransformComponent), true)
          assert.equal(buttonState.rotating, Initial)
          ClientInputFunctions.updateGamepadInput(testEntity)
          assert.equal(buttonState.rotating, Expected)
        })

        it('... should set buttonState.rotating to true when it is not already true, `@param eid` does not have an InputPointerComponent or a TransformComponent, and its rotation from Q_IDENTITY to buttonState.rotation is bigger than the threshold', () => {
          const Buttons = {}
          const GamepadButtons = [] as ButtonState[]

          // Set the initial data from the conditions
          const Initial = false
          const Expected = !Initial
          const buttonState = {
            pressed: true,
            downPosition: new Vector3(1, 1, 1),
            downRotation: new Quaternion(42, 42, 42, 0).normalize(),
            dragging: true,
            rotating: Initial
          } as ButtonState
          const gamepadButton = { pressed: true, touched: true, value: 42 } as ButtonState

          // Set the expected data
          const ID = 0
          Buttons[ID] = buttonState
          GamepadButtons[ID] = gamepadButton
          getMutableComponent(testEntity, InputSourceComponent).merge({
            buttons: Buttons,
            source: {
              gamepad: {
                buttons: GamepadButtons
              } as unknown as Gamepad
            } as XRInputSource
          })
          const targetRotation = Q_IDENTITY
          const distance = buttonState.downRotation?.angleTo(targetRotation)
          assert.equal(distance! > ROTATING_THRESHOLD, true)

          // Run and Check the result
          assert.equal(hasComponent(testEntity, InputPointerComponent), false)
          assert.equal(hasComponent(testEntity, TransformComponent), false)
          assert.equal(buttonState.rotating, Initial)
          ClientInputFunctions.updateGamepadInput(testEntity)
          assert.equal(buttonState.rotating, Expected)
        })
      })
    })

    describe('when neither gamepadButton.pressed nor gamepadButton.touched are true ...', () => {
      it('... should set buttonState.up to true', () => {
        const Buttons = {}
        const GamepadButtons = [] as ButtonState[]

        // Set the initial data from the conditions
        const Initial = false
        const Expected = !Initial
        const buttonState = {
          pressed: true,
          downPosition: new Vector3(1, 1, 1),
          downRotation: new Quaternion(42, 42, 42, 0).normalize(),
          dragging: true,
          rotating: true,
          up: Initial
        } as ButtonState
        const gamepadButton = { pressed: false, touched: false, value: 42 } as ButtonState

        // Set the expected data
        const ID = 0
        Buttons[ID] = buttonState
        GamepadButtons[ID] = gamepadButton
        getMutableComponent(testEntity, InputSourceComponent).merge({
          buttons: Buttons,
          source: {
            gamepad: {
              buttons: GamepadButtons
            } as unknown as Gamepad
          } as XRInputSource
        })

        // Run and Check the result
        assert.equal(gamepadButton.pressed, false)
        assert.equal(gamepadButton.touched, false)
        assert.equal(buttonState.up, Initial)
        ClientInputFunctions.updateGamepadInput(testEntity)
        assert.equal(buttonState.up, Expected)
      })
    })

    it('should not do anything if the `@param eid` InputSourceComponent.source.gamepad object is not set', () => {
      const Buttons = {}

      // Set the initial data from the conditions
      const Initial = false
      const buttonState = {
        pressed: true,
        downPosition: new Vector3(1, 1, 1),
        downRotation: new Quaternion(42, 42, 42, 0).normalize(),
        dragging: true,
        rotating: true,
        up: Initial
      } as ButtonState
      const gamepadButton = { pressed: false, touched: false, value: 42 } as ButtonState

      // Set the expected data
      const ID = 0
      Buttons[ID] = buttonState
      getMutableComponent(testEntity, InputSourceComponent).merge({
        buttons: Buttons,
        source: {
          gamepad: undefined
        } as XRInputSource
      })

      // Run and Check the result
      assert.equal(buttonState.up, Initial)
      ClientInputFunctions.updateGamepadInput(testEntity)
      assert.equal(buttonState.up, Initial)
    })

    it('should not do anything if the `@param eid` InputSourceComponent.source.gamepad.buttons has no buttons set', () => {
      const Buttons = {}
      const GamepadButtons = [] as ButtonState[]

      // Set the initial data from the conditions
      const Initial = false
      const buttonState = {
        pressed: true,
        downPosition: new Vector3(1, 1, 1),
        downRotation: new Quaternion(42, 42, 42, 0).normalize(),
        dragging: true,
        rotating: true,
        up: Initial
      } as ButtonState
      const gamepadButton = { pressed: false, touched: false, value: 42 } as ButtonState

      // Set the expected data
      const ID = 0
      GamepadButtons[ID] = gamepadButton
      getMutableComponent(testEntity, InputSourceComponent).merge({
        buttons: Buttons,
        source: {
          gamepad: {
            buttons: GamepadButtons
          } as unknown as Gamepad
        } as XRInputSource
      })

      // Run and Check the result
      assert.equal(buttonState.up, Initial)
      ClientInputFunctions.updateGamepadInput(testEntity)
      assert.equal(buttonState.up, Initial)
    })
  })

  /**
  // @todo After the XRUI refactor is complete
  // describe('redirectPointerEventsToXRUI', () => {}) // WebContainer3D.hitTest
  */
})
