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
} from '@etherealengine/ecs'
import assert from 'assert'
import sinon from 'sinon'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { InputComponent } from '../components/InputComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import ClientInputFunctions from './ClientInputFunctions'

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
    /**
    // @todo document.activeElement.tagName is readonly. How do we test this?
    it("should do nothing if document.activeElement.tagName is INPUT or TEXTAREA", () => {
      const eventSpy = sinon.spy()
      const Event = { preventDefault: eventSpy }
      assert.ok(!eventSpy.called)
      document.activeElement?.tagName = 'INPUT'
      ClientInputFunctions.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, false)
      document.activeElement?.tagName = 'TEXTAREA'
      ClientInputFunctions.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, false)
    })
    */

    it('should call the preventDefault function of the event/object when its code property is Tab', () => {
      const eventSpy = sinon.spy()
      const Event = { preventDefault: eventSpy, code: 'Tab' }
      assert.ok(!eventSpy.called)
      ClientInputFunctions.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, true)
    })

    it('should call the preventDefault function of the event/object when its code property is Space', () => {
      const eventSpy = sinon.spy()
      const Event = { preventDefault: eventSpy, code: 'Space' }
      assert.ok(!eventSpy.called)
      ClientInputFunctions.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, true)
    })

    it('should call the preventDefault function of the event/object when its code property is Enter', () => {
      const eventSpy = sinon.spy()
      const Event = { preventDefault: eventSpy, code: 'Enter' }
      assert.ok(!eventSpy.called)
      ClientInputFunctions.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, true)
    })

    it('should not call the preventDefault function of the event/object when its code property is an unexpected value', () => {
      const eventSpy = sinon.spy()
      const Event = { preventDefault: eventSpy, code: 'UnexpectedValue' }
      assert.ok(!eventSpy.called)
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

  describe('updateGamepadInput', () => {})
  describe('updatePointerDragging', () => {})
  describe('cleanupButton', () => {})
  describe('redirectPointerEventsToXRUI', () => {})
  describe('assignInputSource', () => {})
})
