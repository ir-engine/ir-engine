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
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@etherealengine/ecs'
import { startReactor } from '@etherealengine/hyperflux'
import assert from 'assert'
import sinon from 'sinon'
import { MockEventListener } from '../../../tests/util/MockEventListener'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { TransformComponent } from '../../SpatialModule'
import ClientInputHooks from './ClientInputHooks'

describe('ClientInputHooks', () => {
  describe('useNonSpatialInputSources', () => {
    let testEntity = UndefinedEntity
    let ev: MockEventListener

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, VisibleComponent)

      ev = new MockEventListener()
      globalThis.document.addEventListener = ev.addEventListener as any
      globalThis.document.removeEventListener = ev.removeEventListener as any
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add a DOMMouseScroll EventListener to the DOM when mounted', () => {
      const EvName = 'DOMMouseScroll'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a gesturestart EventListener to the DOM when mounted', () => {
      const EvName = 'gesturestart'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a keyup EventListener to the DOM when mounted', () => {
      const EvName = 'keyup'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add two keydown EventListeners to the DOM when mounted', () => {
      const EvName = 'keydown'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      assert.equal(ev.listeners[EvName].length, 2)
    })

    it('should add a touchstickmove EventListener to the DOM when mounted', () => {
      const EvName = 'touchstickmove'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a touchgamepadbuttonup EventListener to the DOM when mounted', () => {
      const EvName = 'touchgamepadbuttonup'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a touchgamepadbuttondown EventListener to the DOM when mounted', () => {
      const EvName = 'touchgamepadbuttondown'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should remove the DOMMouseScroll EventListener from the DOM when mounted', () => {
      const EvName = 'DOMMouseScroll'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      const fiber = root.fiber
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the gesturestart EventListener from the DOM when mounted', () => {
      const EvName = 'gesturestart'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      const fiber = root.fiber
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the keyup EventListener from the DOM when mounted', () => {
      const EvName = 'keyup'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      const fiber = root.fiber
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })

    /** @todo Pending review. The implementation of the cleanup for this event seems broken */
    it('should remove both keydown EventListeners from the DOM when mounted', () => {
      const EvName = 'keydown'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      const fiber = root.fiber
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the touchstickmove EventListener from the DOM when mounted', () => {
      const EvName = 'touchstickmove'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      const fiber = root.fiber
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the touchgamepadbuttonup EventListener from the DOM when mounted', () => {
      const EvName = 'touchgamepadbuttonup'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      const fiber = root.fiber
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the touchgamepadbuttondown EventListener from the DOM when mounted', () => {
      const EvName = 'touchgamepadbuttondown'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useNonSpatialInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Create a reactor root to run the hook's reactor.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      const fiber = root.fiber
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })
  })

  /**
  // @todo
  describe("useGamepadInputSources", () => {})
  describe("useXRInputSources", () => {})
  describe("CanvasInputReactor", () => {})
  describe("MeshInputReactor", () => {})
  describe("BoundingBoxInputReactor", () => {})
  */
})
