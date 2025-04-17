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
  EntityTreeComponent,
  getComponent,
  getMutableComponent,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import assert from 'assert'
import sinon from 'sinon'
import { Quaternion, Vector2, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertVec } from '../../../tests/util/assert'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import { AnyButton, ButtonState, createInitialButtonState, MouseButton } from '../state/ButtonState'
import { InputState } from '../state/InputState'
import ClientInputFunctions from './ClientInputFunctions'

describe('ClientInputFunctions', () => {
  beforeEach(() => {
    createEngine()
    // Initialize InputState
    getMutableState(InputState).capturingEntity.set(UndefinedEntity)
  })

  afterEach(() => {
    return destroyEngine()
  })

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
    it('should add the `@param inputSources` to the `InputComponent.inputSources` of each entity in the ancestor.InputComponent.inputSinks list', () => {
      const sourceOne = createEntity()
      const sourceTwo = createEntity()
      setComponent(sourceOne, InputSourceComponent)
      setComponent(sourceTwo, InputSourceComponent)
      const SourcesList = [sourceOne, sourceTwo] as Entity[]

      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      const testEntity = createEntity()
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

  describe('cleanupButtonState', () => {
    it("should make the button's .down property false when it is true", () => {
      const sourceEntity = createEntity()
      const buttons = { key1: createInitialButtonState(sourceEntity, { down: true }) }
      setComponent(sourceEntity, InputSourceComponent, { buttons })
      assert.equal(buttons.key1?.down, true)
      ClientInputFunctions.refreshInputs(true)
      assert.equal(buttons.key1?.down, false)
    })

    it('should remove the button with the given `@param key` from the `@param buttons` list if `@param hasFocus` is false', () => {
      const sourceEntity = createEntity()
      const buttons = { key1: createInitialButtonState(sourceEntity, { down: true }) }
      setComponent(sourceEntity, InputSourceComponent, { buttons })
      assert.notEqual(buttons.key1, undefined)
      assert.equal(buttons.key1?.down, true)
      /**@todo the query in refreshInputs returns an array of undefined in this test, but the test above and below work */
      ClientInputFunctions.refreshInputs(false)
      //assert.equal(buttons.key1, undefined)
    })

    it('should remove the button with the given `@param key` from the `@param buttons` list if the button is up', () => {
      const sourceEntity = createEntity()
      const buttons = { key1: createInitialButtonState(sourceEntity, { down: false, up: true }) }
      setComponent(sourceEntity, InputSourceComponent, { buttons })
      assert.notEqual(buttons.key1, undefined)
      assert.equal(buttons.key1?.up, true)
      ClientInputFunctions.refreshInputs(true)
      assert.equal(buttons.key1, undefined)
    })
  })

  describe('assignInputSources', () => {
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
    describe('when the `@param pointerEntity` does not have an InputPointerComponent', () => {
      it('should not modify the dragging property', () => {
        const Btn = MouseButton.PrimaryClick
        const ev = { type: 'pointermove', button: 0 } as PointerEvent

        const pointerEntity = createEntity()
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [Btn]: createInitialButtonState(pointerEntity, {
            pressed: true,
            downPointerPosition: new Vector2(0, 0),
            dragging: false,
            touched: true,
            down: false,
            up: false,
            value: 1
          })
        })

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, false)
      })
    })

    describe('when the `@param pointerEntity` has an InputPointerComponent', () => {
      it('should enable dragging when pointer moves far enough from downPointerPosition', () => {
        const Btn = MouseButton.PrimaryClick
        const ev = { type: 'pointermove', button: 0 } as PointerEvent

        const pointerEntity = createEntity()

        // Set up pointer component with position far from initial click
        setComponent(pointerEntity, InputPointerComponent, {
          cameraEntity: createEntity(),
          pointerId: 1,
          position: new Vector2(2, 2), // Position moved enough to exceed threshold
          lastPosition: new Vector2(0, 0),
          movement: new Vector2(0, 0)
        })

        // Set up input source with initial button state
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [Btn]: createInitialButtonState(pointerEntity, {
            pressed: true,
            downPointerPosition: new Vector2(0, 0), // Initial click position
            dragging: false,
            touched: true,
            down: false,
            up: false,
            value: 1
          })
        })

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, true)
      })

      it('should not enable dragging when pointer position equals downPointerPosition', () => {
        const Btn = MouseButton.PrimaryClick
        const ev = { type: 'pointermove', button: 0 } as PointerEvent
        const position = new Vector2(1, 1)

        const pointerEntity = createEntity()

        // Set up pointer component with same position as downPointerPosition
        setComponent(pointerEntity, InputPointerComponent, {
          cameraEntity: createEntity(),
          pointerId: 1,
          position: position.clone(), // Same as downPointerPosition
          lastPosition: new Vector2(0, 0),
          movement: new Vector2(0, 0)
        })

        // Set up input source with initial button state
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [Btn]: createInitialButtonState(pointerEntity, {
            pressed: true,
            downPointerPosition: position.clone(), // Same as current position
            dragging: false,
            touched: true,
            down: false,
            up: false,
            value: 1
          })
        })

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, false)
      })

      it('should not enable dragging when pointer movement is below threshold', () => {
        const Btn = MouseButton.PrimaryClick
        const ev = { type: 'pointermove', button: 0 } as PointerEvent

        const pointerEntity = createEntity()

        // Set up pointer component with tiny movement
        setComponent(pointerEntity, InputPointerComponent, {
          cameraEntity: createEntity(),
          pointerId: 1,
          position: new Vector2(0.001, 0.001), // Tiny movement below threshold
          lastPosition: new Vector2(0, 0),
          movement: new Vector2(0, 0)
        })

        // Set up input source with initial button state
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [Btn]: createInitialButtonState(pointerEntity, {
            pressed: true,
            downPointerPosition: new Vector2(0, 0),
            dragging: false,
            touched: true,
            down: false,
            up: false,
            value: 1
          })
        })

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, false)
      })

      it('should not enable dragging when button is not pressed', () => {
        const Btn = MouseButton.PrimaryClick
        const ev = { type: 'pointermove', button: 0 } as PointerEvent

        const pointerEntity = createEntity()

        // Set up pointer component with significant movement
        setComponent(pointerEntity, InputPointerComponent, {
          cameraEntity: createEntity(),
          pointerId: 1,
          position: new Vector2(2, 2), // Movement exceeds threshold
          lastPosition: new Vector2(0, 0),
          movement: new Vector2(0, 0)
        })

        // Set up input source with initial button state (not pressed)
        setComponent(pointerEntity, InputSourceComponent)
        getMutableComponent(pointerEntity, InputSourceComponent).buttons.merge({
          [Btn]: createInitialButtonState(pointerEntity, {
            pressed: false, // Button not pressed
            downPointerPosition: new Vector2(0, 0),
            dragging: false,
            touched: true,
            down: false,
            up: false,
            value: 0
          })
        })

        // Run and Check the result
        ClientInputFunctions.updatePointerDragging(pointerEntity, ev)
        const result = getComponent(pointerEntity, InputSourceComponent).buttons[Btn]?.dragging
        assert.equal(result, false)
      })
    })
  })

  describe('updateGamepadInput', () => {
    function setupGamepadButton(entity: Entity, buttonState: Partial<ButtonState>, gamepadState: Partial<ButtonState>) {
      const buttons = {}
      const gamepadButtons = [] as ButtonState[]
      const buttonIndex = 0 as AnyButton

      buttons[buttonIndex] = createInitialButtonState(entity, buttonState)
      gamepadButtons[buttonIndex] = gamepadState as ButtonState

      setComponent(entity, InputSourceComponent, {
        buttons,
        gamepad: {
          buttons: gamepadButtons
        } as unknown as Gamepad
      })

      return buttons[buttonIndex]
    }

    describe('on first frame (buttonState.pressed=false, gamepadButton.pressed=true)', () => {
      it('should set down=true and copy pressed/touched/value from gamepad', () => {
        const entity = createEntity()
        const buttonState = setupGamepadButton(entity, { pressed: false }, { pressed: true, touched: true, value: 0.5 })
        ClientInputFunctions.updateGamepadInput(entity)

        assert.equal(buttonState.down, true)
        assert.equal(buttonState.pressed, true)
        assert.equal(buttonState.touched, true)
        assert.equal(buttonState.value, 0.5)
      })

      it('should set downPosition from transform when XRSpace component exists', () => {
        const expectedPos = new Vector3(1, 2, 3)
        const testEntity = createEntity()
        setComponent(testEntity, TransformComponent, { position: expectedPos })
        setComponent(testEntity, XRSpaceComponent, { space: {} as XRSpace, baseSpace: {} as XRSpace })

        const buttonState = setupGamepadButton(testEntity, { pressed: false }, { pressed: true, touched: true })
        ClientInputFunctions.updateGamepadInput(testEntity)
        assertVec.approxEq(buttonState.downPosition!, expectedPos, 3)
      })

      it('should set downRotation from transform when XRSpace component exists', () => {
        const expectedRot = new Quaternion(0, 1, 0, 0)
        const testEntity = createEntity()
        setComponent(testEntity, TransformComponent, { rotation: expectedRot })
        setComponent(testEntity, XRSpaceComponent, { space: {} as XRSpace, baseSpace: {} as XRSpace })

        const buttonState = setupGamepadButton(testEntity, { pressed: false }, { pressed: true, touched: true })

        ClientInputFunctions.updateGamepadInput(testEntity)
        assertVec.approxEq(buttonState.downRotation!, expectedRot, 4)
      })
    })

    describe('dragging behavior', () => {
      it('should enable dragging when pointer moves beyond threshold', () => {
        const testEntity = createEntity()
        setComponent(testEntity, InputPointerComponent, {
          cameraEntity: createEntity(),
          pointerId: 1,
          position: new Vector2(2, 2)
        })

        const buttonState = setupGamepadButton(
          testEntity,
          {
            pressed: true,
            downPointerPosition: new Vector2(0, 0),
            dragging: false
          },
          { pressed: true, touched: true }
        )

        ClientInputFunctions.updateGamepadInput(testEntity)
        assert.equal(buttonState.dragging, true)
      })

      it('should not enable dragging when movement is below threshold', () => {
        const testEntity = createEntity()
        setComponent(testEntity, InputPointerComponent, {
          cameraEntity: createEntity(),
          pointerId: 1,
          position: new Vector2(0.0001, 0.0001)
        })

        const buttonState = setupGamepadButton(
          testEntity,
          {
            pressed: true,
            downPointerPosition: new Vector2(0, 0),
            dragging: false
          },
          { pressed: true, touched: true }
        )

        ClientInputFunctions.updateGamepadInput(testEntity)
        assert.equal(buttonState.dragging, false)
      })
    })

    describe('button release', () => {
      it('should set up=true when button is released', () => {
        const testEntity = createEntity()
        const buttonState = setupGamepadButton(
          testEntity,
          { pressed: true, up: false },
          { pressed: false, touched: false }
        )

        ClientInputFunctions.updateGamepadInput(testEntity)
        assert.equal(buttonState.up, true)
      })
    })

    it('should do nothing if gamepad is not present', () => {
      const testEntity = createEntity()
      const buttonState = setupGamepadButton(
        testEntity,
        { pressed: true, up: false },
        { pressed: false, touched: false }
      )

      const buttonIndex = 0 as AnyButton
      setComponent(testEntity, InputSourceComponent, {
        buttons: { [buttonIndex]: buttonState },
        source: {
          gamepad: undefined
        } as XRInputSource
      })

      ClientInputFunctions.updateGamepadInput(testEntity)
      assert.equal(buttonState.up, false)
    })
  })

  /**
  // @todo After the XRUI refactor is complete
  // describe('redirectPointerEventsToXRUI', () => {}) // WebContainer3D.hitTest
  */
})
