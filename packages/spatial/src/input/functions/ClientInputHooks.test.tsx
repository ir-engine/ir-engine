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
  getMutableComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@etherealengine/ecs'
import { getMutableState, startReactor } from '@etherealengine/hyperflux'
import assert from 'assert'
import sinon from 'sinon'
import { MockEventListener } from '../../../tests/util/MockEventListener'
import { MockXRSession } from '../../../tests/util/MockXR'
import { destroySpatialEngine, initializeSpatialEngine } from '../../initializeEngine'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../SpatialModule'
import { XRState } from '../../xr/XRState'
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
      // Run the reactor and check the result.
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
      // Run the reactor and check the result.
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
      // Run the reactor and check the result.
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
      // Run the reactor and check the result.
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
      // Run the reactor and check the result.
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
      // Run the reactor and check the result.
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
      // Run the reactor and check the result.
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
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
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
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
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
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
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
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
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
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
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
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
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
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })
  })

  describe('useGamepadInputSources', () => {
    let testEntity = UndefinedEntity
    let ev: MockEventListener

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, VisibleComponent)

      ev = new MockEventListener()
      globalThis.window.addEventListener = ev.addEventListener as any
      globalThis.window.removeEventListener = ev.removeEventListener as any
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add a gamepadconnected window.EventListener to the DOM.window when mounted', () => {
      const EvName = 'gamepadconnected'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useGamepadInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a gamepaddisconnected EventListener to the DOM.window when mounted', () => {
      const EvName = 'gamepaddisconnected'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useGamepadInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should remove the gamepadconnected EventListener from the DOM.window when mounted', () => {
      const EvName = 'gamepadconnected'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useGamepadInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the gamepaddisconnected EventListener from the DOM.window when mounted', () => {
      const EvName = 'gamepaddisconnected'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useGamepadInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })
  })

  describe('useXRInputSources', () => {
    let testEntity = UndefinedEntity
    let ev: MockEventListener

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, VisibleComponent)

      getMutableState(XRState).set(XRState.initial())
      // @ts-ignore Coerce the mock type into the XRSession slot
      getMutableState(XRState).session.set(new MockXRSession())
      const session = getMutableState(XRState).get({ noproxy: true }).session!
      ev = new MockEventListener()
      // @ts-ignore Coerce the listener function into the readonly property
      session.addEventListener = ev.addEventListener as any
      // @ts-ignore Coerce the listener function into the readonly property
      session.removeEventListener = ev.removeEventListener as any
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add a inputsourceschange EventListener to the XRState.session when mounted', () => {
      const EvName = 'inputsourceschange'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useXRInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a selectstart EventListener to the XRState.session when mounted', () => {
      const EvName = 'selectstart'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useXRInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a selectend EventListener to the XRState.session when mounted', () => {
      const EvName = 'selectend'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useXRInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should remove the inputsourceschange EventListener from the XRState.session when mounted', () => {
      const EvName = 'inputsourceschange'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useXRInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the selectstart EventListener from the XRState.session when mounted', () => {
      const EvName = 'selectstart'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useXRInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the selectend EventListener from the XRState.session when mounted', () => {
      const EvName = 'selectend'
      const reactorSpy = sinon.spy()
      // Create the Reactor setup
      const Reactor = () => {
        reactorSpy()
        ClientInputHooks.useXRInputSources()
        return null
      }
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(ev.hasEvent(EvName), false)
      // Run the reactor and check the result.
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(ev.hasEvent(EvName), true)
      root.stop()
      assert.equal(ev.hasEvent(EvName), false)
    })
  })

  describe.skip('CanvasInputReactor', () => {
    let testEntity = UndefinedEntity
    let ev: MockEventListener

    beforeEach(async () => {
      createEngine()
      initializeSpatialEngine()

      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, VisibleComponent)
      setComponent(testEntity, RendererComponent)
      ev = new MockEventListener()
      const rendererComponent = getMutableComponent(testEntity, RendererComponent).get({ noproxy: true })

      // @ts-ignore Coerce the listener function into the readonly property
      rendererComponent.canvas.addEventListener = ev.addEventListener as any
      // @ts-ignore Coerce the listener function into the readonly property
      rendererComponent.canvas.removeEventListener = ev.removeEventListener as any
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should add a dragstart EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'dragstart'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(ClientInputHooks.CanvasInputReactor)
      assert.equal(ev.hasEvent(EvName), true)
      // root.stop()
      // assert.equal(ev.hasEvent(EvName), false)
    })

    // it("should not do anything if there is a valid XRState.session", () => {})
    // it("should trigger whenever XRState.session changes", () => {})
    // it("should add a contextmenu EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})
    // it("should add a pointerenter EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})
    // it("should add a pointerover EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})
    // it("should add a pointerout EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})
    // it("should add a pointerleave EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})
    // it("should add a pointermove EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})
    // it("should add a pointerup EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})
    // it("should add a pointerdown EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})
    // it("should add a blur EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})
    // it("should add a visibilitychange EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})
    // it("should add a click EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})
    // it("should add a wheel EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value", () => {})

    // it("should remove the dragstart EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the contextmenu EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the pointerenter EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the pointerover EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the pointerout EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the pointerleave EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the pointermove EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the pointerup EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the pointerdown EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the blur EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the visibilitychange EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the click EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
    // it("should remove the wheel EventListener from the RendererComponent.canvas whenever XRState.session is a truthy value", () => {})
  })

  /**
  // @todo
  describe("MeshInputReactor", () => {
    // it("should trigger whenever the entityContext.ancestor gets or removes its InputComponent", () => {})
    // it("should add the entityContext to the InputState.inputMeshes list when the entity.ancestor has an InputComponent", () => {})
    // it("should remove the entityContext from the InputState.inputMeshes list when the entity.ancestor does not have an InputComponent", () => {})
  })
  describe("BoundingBoxInputReactor", () => {
    // it("should trigger whenever the entityContext.ancestor gets or removes its InputComponent", () => {})
    // it("should add the entityContext to the InputState.inputBoundingBoxes list when the entity.ancestor has an InputComponent", () => {})
    // it("should remove the entityContext from the InputState.inputBoundingBoxes list when the entity.ancestor does not have an InputComponent", () => {})
  })
  */
})