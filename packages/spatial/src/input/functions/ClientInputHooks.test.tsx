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
  EntityContext,
  removeComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { getMutableState, getState, ReactorRoot, startReactor } from '@ir-engine/hyperflux'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import sinon from 'sinon'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { MockEventListener } from '../../../tests/util/MockEventListener'
import { MockXRSession } from '../../../tests/util/MockXR'
import { destroySpatialEngine, initializeSpatialEngine } from '../../initializeEngine'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRState } from '../../xr/XRState'
import { InputComponent } from '../components/InputComponent'
import { InputState } from '../state/InputState'
import ClientInputHooks from './ClientInputHooks'

const createMockHTMLCanvasElement = (ev: MockEventListener) => {
  return {
    addEventListener: ev.addEventListener,
    removeEventListener: ev.removeEventListener,
    getDrawingBufferSize: () => 0,
    getContext: () => {},
    parentElement: {
      clientWidth: 100,
      clientHeight: 100
    }
  } as any as HTMLCanvasElement
}

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

  describe('CanvasInputReactor', () => {
    let testEntity = UndefinedEntity
    let ev: MockEventListener

    beforeEach(async () => {
      createEngine()
      initializeSpatialEngine()

      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, VisibleComponent)

      ev = new MockEventListener()
      setComponent(testEntity, RendererComponent, { canvas: createMockHTMLCanvasElement(ev) })
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
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a contextmenu EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'contextmenu'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a pointerenter EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'pointerenter'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a pointerover EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'pointerover'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a pointerout EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'pointerout'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a pointerleave EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'pointerleave'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a pointermove EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'pointermove'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a pointerup EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'pointerup'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a pointerdown EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'pointerdown'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a blur EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'blur'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a visibilitychange EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'visibilitychange'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a click EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'click'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should add a wheel EventListener to the RendererComponent.canvas whenever XRState.session is a falsy value', () => {
      const EvName = 'wheel'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the result.
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)
    })

    it('should remove the dragstart EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'dragstart'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the contextmenu EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'contextmenu'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the pointerenter EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'pointerenter'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the pointerover EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'pointerover'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the pointerout EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'pointerout'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the pointerleave EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'pointerleave'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the pointermove EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'pointermove'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the pointerup EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'pointerup'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the pointerdown EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'pointerdown'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the blur EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'blur'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the visibilitychange EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'visibilitychange'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the click EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'click'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should remove the wheel EventListener from the RendererComponent.canvas whenever XRState.session changes to a truthy value', () => {
      const EvName = 'wheel'
      assert.equal(ev.hasEvent(EvName), false)

      // Run the reactor and check the mount case for sanity check
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), true)

      // Change XRState.session and check that it removes the event as a sideffect
      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })

    it('should not do anything if there is a valid XRState.session', () => {
      const EvName = 'click'
      assert.equal(ev.hasEvent(EvName), false)

      getMutableState(XRState).session.set(new MockXRSession() as XRSession)
      assert.notEqual(getState(XRState).session, null)

      // Run the reactor and check the result
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.CanvasInputReactor, {})
        )
      }) as ReactorRoot
      assert.equal(ev.hasEvent(EvName), false)
      // Rerun and check that nothing changed
      root.run()
      assert.notEqual(getState(XRState).session, null)
      assert.equal(ev.hasEvent(EvName), false)
    })
  })

  describe('MeshInputReactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, VisibleComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add the entityContext to the InputState.inputMeshes list when the entity.ancestor has an InputComponent', () => {
      setComponent(testEntity, InputComponent)
      const before = getState(InputState).inputMeshes
      assert.equal(before.has(testEntity), false)

      // Run the reactor and check the result
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.MeshInputReactor, {})
        )
      }) as ReactorRoot
      const result = getState(InputState).inputMeshes
      assert.equal(result.has(testEntity), true)
    })

    it('should remove the entityContext from the InputState.inputMeshes list when the entity.ancestor does not have an InputComponent', () => {
      // setComponent(testEntity, InputComponent)  // Do not set the InputComponent on the entity
      getMutableState(InputState).inputMeshes.set(new Set([testEntity] as Entity[])) // Force-add the entity manually, to check this code path in isolation
      const before = getState(InputState).inputMeshes
      assert.equal(before.has(testEntity), true)

      // Run the reactor and check the result
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.MeshInputReactor, {})
        )
      }) as ReactorRoot
      const result = getState(InputState).inputMeshes
      assert.equal(result.has(testEntity), false)
    })

    it('should trigger whenever the entityContext.ancestor gets or removes its InputComponent', async () => {
      const before = getState(InputState).inputMeshes
      assert.equal(before.has(testEntity), false)

      // Create the ancestor entity that contains the InputComponent
      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      setComponent(parentEntity, EntityTreeComponent)

      // setComponent(testEntity, InputComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      assert.equal(before.has(testEntity), false)

      // Setup the reactor
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.MeshInputReactor, {})
        )
      }) as ReactorRoot

      root.run()

      // Check the result
      const one = getState(InputState).inputMeshes
      assert.equal(one.has(testEntity), true)

      removeComponent(parentEntity, InputComponent)
      root.run()

      const two = getState(InputState).inputMeshes
      assert.equal(two.has(testEntity), false)
    })
  })

  describe('BoundingBoxInputReactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, VisibleComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add the entityContext to the InputState.inputBoundingBoxes list when the entity.ancestor has an InputComponent', () => {
      setComponent(testEntity, InputComponent)
      const before = getState(InputState).inputBoundingBoxes
      assert.equal(before.has(testEntity), false)

      // Run the reactor and check the result
      const root = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.BoundingBoxInputReactor, {})
        )
      }) as ReactorRoot
      const result = getState(InputState).inputBoundingBoxes
      assert.equal(result.has(testEntity), true)
    })

    it('should remove the entityContext from the InputState.inputBoundingBoxes list when the entity.ancestor does not have an InputComponent', () => {
      // setComponent(testEntity, InputComponent)  // Do not set the InputComponent on the entity
      getMutableState(InputState).inputBoundingBoxes.set(new Set([testEntity] as Entity[])) // Force-add the entity manually, to check this code path in isolation
      const before = getState(InputState).inputBoundingBoxes
      assert.equal(before.has(testEntity), true)

      // Run the reactor and check the result
      const Reactor = startReactor(() => {
        return React.createElement(
          EntityContext.Provider,
          { value: testEntity },
          React.createElement(ClientInputHooks.BoundingBoxInputReactor, {})
        )
      }) as ReactorRoot
      const result = getState(InputState).inputBoundingBoxes
      assert.equal(result.has(testEntity), false)
    })

    it('should trigger whenever the entityContext.ancestor gets or removes its InputComponent', async () => {
      const before = getState(InputState).inputMeshes
      assert.equal(before.has(testEntity), false)

      // Create the ancestor entity that contains the InputComponent
      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      setComponent(parentEntity, EntityTreeComponent)

      // setComponent(testEntity, InputComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      assert.equal(before.has(testEntity), false)

      // Setup the reactor
      const Reactor = React.createElement(
        EntityContext.Provider,
        { value: testEntity },
        React.createElement(ClientInputHooks.BoundingBoxInputReactor, {})
      )

      const { rerender, unmount } = render(Reactor)
      await act(() => rerender(Reactor))

      // Check the result
      const one = getState(InputState).inputBoundingBoxes
      assert.equal(one.has(testEntity), true)

      removeComponent(parentEntity, InputComponent)
      await act(() => rerender(Reactor))
      const two = getState(InputState).inputBoundingBoxes
      assert.equal(two.has(testEntity), false)

      unmount()
    })
  })
})
