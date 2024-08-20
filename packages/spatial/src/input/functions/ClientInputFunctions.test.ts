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
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import assert from 'assert'
import sinon from 'sinon'
import { Vector2, Vector3 } from 'three'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import { ButtonState, ButtonStateMap, MouseButton } from '../state/ButtonState'
import ClientInputFunctions from './ClientInputFunctions'
import ClientInputHeuristics, { HeuristicData, HeuristicFunctions } from './ClientInputHeuristics'
import { createHeuristicDummyData } from './ClientInputHeuristics.test'

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
    const mockDocumentPrev = { ...globalThis.document } as Document

    const mockInput = {
      ...globalThis.document,
      activeElement: {
        ...globalThis.document.activeElement,
        tagName: 'INPUT'
      } as Element
    } as Document

    const mockTextArea = {
      ...globalThis.document,
      activeElement: {
        ...globalThis.document.activeElement,
        tagName: 'TEXTAREA'
      } as Element
    } as Document

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
    let data = {} as HeuristicData
    const heuristics = {
      editor: ClientInputHeuristics.findEditor,
      xrui: ClientInputHeuristics.findXRUI,
      physicsColliders: ClientInputHeuristics.findPhysicsColliders,
      bboxes: ClientInputHeuristics.findBBoxes,
      meshes: ClientInputHeuristics.findMeshes,
      proximity: ClientInputHeuristics.findProximity,
      raycastedInput: ClientInputHeuristics.findRaycastedInput
    } as HeuristicFunctions

    beforeEach(async () => {
      createEngine()
      data = createHeuristicDummyData()
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
      ClientInputFunctions.assignInputSources(sourceEntity, capturedEntity, data, heuristics)
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
      ClientInputFunctions.assignInputSources(sourceEntity, capturedEntity, data, heuristics)
      const SourcesList = [sourceEntity, otherEntity]
      const result = getComponent(capturedEntity, InputComponent).inputSources
      for (const entity of SourcesList) {
        assert.equal(result.includes(entity), true)
      }
    })

    it('should call the heuristic.raycastedInput function when the `@param sourceEid` has a TransformComponent', () => {
      const spy = sinon.spy()
      heuristics.raycastedInput = spy

      const PointerID = 42
      const cameraEntity = createEntity()
      const capturedEntity = UndefinedEntity
      const sourceEntity = createEntity()
      setComponent(sourceEntity, TransformComponent)
      setComponent(sourceEntity, InputSourceComponent)
      setComponent(sourceEntity, InputPointerComponent, { pointerId: PointerID, cameraEntity: cameraEntity })
      assert.equal(spy.callCount, 0)

      // Run and Check the result
      ClientInputFunctions.assignInputSources(sourceEntity, capturedEntity, data, heuristics)
      assert.equal(spy.callCount, 1)
    })

    it('should call the heuristic.proximity function when the `@param capturedEntity` is undefined, intersectionData.length is 0 and `@param sourceEid` does not have a InputPointerComponent', () => {
      const spy = sinon.spy()
      heuristics.proximity = spy

      const capturedEntity = UndefinedEntity
      const sourceEntity = createEntity()
      setComponent(sourceEntity, InputSourceComponent)

      // Run and Check the result
      ClientInputFunctions.assignInputSources(sourceEntity, capturedEntity, data, heuristics)
      assert.equal(spy.callCount, 1)
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

  describe.skip('updateGamepadInput', () => {
    // should set the button's downPosition property to the InputPointerComponent.position
    it('...?', () => {
      const pointerEntity = createEntity()
      setComponent(pointerEntity, InputSourceComponent)
      setComponent(pointerEntity, InputPointerComponent, { pointerId: 123, cameraEntity: UndefinedEntity })
      getMutableComponent(pointerEntity, InputPointerComponent).position.set(new Vector2(42, 42))

      const Buttons = [{ pressed: true, touched: true, value: 42 }] as GamepadButton[]
      getMutableComponent(pointerEntity, InputSourceComponent).merge({
        buttons: {
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
        },
        source: {
          gamepad: {
            buttons: Buttons
          } as unknown as Gamepad
        } as XRInputSource
      })

      // Run and Check the result
      ClientInputFunctions.updateGamepadInput(pointerEntity)
      const result = false
      assert.equal(result, true)
    })
  })

  /**
  // @todo After the XRUI refactor is completed
  // first (raycast)
  // describe('redirectPointerEventsToXRUI', () => {}) // WebContainer3D.hitTest
  */
})
