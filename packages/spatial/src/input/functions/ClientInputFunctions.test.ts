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
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import assert from 'assert'
import sinon from 'sinon'
import { Quaternion, Ray, Raycaster, Vector3 } from 'three'
import { RaycastArgs } from '../../physics/classes/Physics'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import { ButtonState, ButtonStateMap } from '../state/ButtonState'
import ClientInputFunctions from './ClientInputFunctions'
import ClientInputHeuristics, { HeuristicData, HeuristicFunctions } from './ClientInputHeuristics'

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

  // intermediate
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
      data = {
        quaternion: new Quaternion(),
        ray: new Ray(),
        raycast: {} as RaycastArgs,
        caster: new Raycaster(),
        hitTarget: new Vector3()
      } as HeuristicData
    })

    afterEach(() => {
      return destroyEngine()
    })

    /**
    // @todo
    it("....", () => {

      const capturedEntity = UndefinedEntity
      const sourceEntity = createEntity()
      setComponent(sourceEntity, TransformComponent)
      setComponent(sourceEntity, InputSourceComponent)
      setComponent(sourceEntity, InputPointerComponent)

      ClientInputFunctions.assignInputSources(sourceEntity, capturedEntity, data, heuristics)


      const result = getComponent(parentEntity, InputComponent).inputSources
      for (const source of SourcesList) {
        assert.equal(result.includes(source), true)
      }
    })
    */

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

    /**
    // @todo create a sorted array from the intersection data
    // @todo should add
    */
  })

  /**
  // @todo very branchy
  describe('updatePointerDragging', () => {})
  describe('updateGamepadInput', () => {})
  */

  /**
  // @todo After the XRUI refactor is completed
  // first (raycast)
  // describe('redirectPointerEventsToXRUI', () => {}) // WebContainer3D.hitTest
  */
})
