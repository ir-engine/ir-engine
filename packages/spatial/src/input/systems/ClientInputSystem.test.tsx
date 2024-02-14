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

import assert from 'assert'

import { World } from '@dimforge/rapier3d-compat'
import { getComponent, hasComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine, destroyEngine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { entityExists } from '@etherealengine/ecs/src/EntityFunctions'
import { SystemDefinitions } from '@etherealengine/ecs/src/SystemFunctions'
import { HyperFlux, getMutableState, getState } from '@etherealengine/hyperflux'
import { WebContainer3D } from '@etherealengine/xrui'
import { render } from '@testing-library/react'
import { getAllEntities } from 'bitecs'
import React from 'react'
import { Ray, Vector3 } from 'three'
import { MockEngineRenderer } from '../../../tests/util/MockEngineRenderer'
import { mockEvent } from '../../../tests/util/MockEvent'
import { MockEventListener } from '../../../tests/util/MockEventListener'
import { MockNavigator } from '../../../tests/util/MockNavigator'
import { MockXRFrame, MockXRInputSource, MockXRReferenceSpace, MockXRSpace } from '../../../tests/util/MockXR'
import { NameComponent } from '../../common/NameComponent'
import { createEngine } from '../../initializeEngine'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { BoundingBoxComponent } from '../../transform/components/BoundingBoxComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { XRState } from '../../xr/XRState'
import { XRUIState } from '../../xrui/XRUIState'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { InputComponent } from '../components/InputComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import { InputState } from '../state/InputState'
import { ClientInputSystem, addClientInputListeners } from './ClientInputSystem'

describe('addClientInputListeners', () => {
  let documentAddEvent
  let documentRemoveEvent
  let windowAddEvent
  let windowRemoveEvent
  let navigatorCopy

  const mockDocEvents = new MockEventListener()
  const mockWinEvents = new MockEventListener()

  before(() => {
    documentAddEvent = globalThis.document.addEventListener
    documentRemoveEvent = globalThis.document.removeEventListener
    windowAddEvent = globalThis.window.addEventListener
    windowRemoveEvent = globalThis.window.removeEventListener
    navigatorCopy = globalThis.navigator

    globalThis.document.addEventListener = mockDocEvents.addEventListener as any
    globalThis.document.removeEventListener = mockDocEvents.removeEventListener as any
    globalThis.window.addEventListener = mockWinEvents.addEventListener as any
    globalThis.window.removeEventListener = mockWinEvents.removeEventListener as any
    Object.defineProperty(globalThis, 'navigator', { value: new MockNavigator() as any })
    globalThis.ReferenceSpace.origin = new MockXRReferenceSpace()
  })

  after(() => {
    globalThis.document.addEventListener = documentAddEvent
    globalThis.document.removeEventListener = documentRemoveEvent
    globalThis.window.addEventListener = windowAddEvent
    globalThis.window.removeEventListener = windowRemoveEvent
    Object.defineProperty(globalThis, 'navigator', { value: navigatorCopy })
  })

  beforeEach(() => {
    createEngine()
    EngineRenderer.instance = new MockEngineRenderer()
  })

  afterEach(() => {
    EngineRenderer.instance = undefined!
    return destroyEngine()
  })

  it('should add client input listeners', () => {
    const cleanup = addClientInputListeners()

    assert(typeof cleanup === 'function')

    const mock: MockEngineRenderer = EngineRenderer.instance as MockEngineRenderer
    const mockDomElm = mock.renderer.domElement as unknown as MockEventListener
    assert(mockDomElm.listeners.length > 0, 'Callbacks were added to canvas')
    mockDomElm.listeners.forEach((listener) => {
      listener(mockEvent)
    })

    assert(mockDocEvents.listeners.length > 0, 'Callbacks were added to document')
    mockDocEvents.listeners.forEach((listener) => {
      listener(mockEvent)
    })

    assert(mockWinEvents.listeners.length > 0, 'Callbacks were added to window')
    mockWinEvents.listeners.forEach((listener) => {
      listener(mockEvent)
    })

    const entities = getAllEntities(HyperFlux.store)
    const emulatedInputSourceEntity = entities[entities.length - 1] as Entity

    assert(entityExists(emulatedInputSourceEntity))
    assert(hasComponent(emulatedInputSourceEntity, InputSourceComponent))
    assert(hasComponent(emulatedInputSourceEntity, NameComponent))

    const pointerStatePos = getState(InputState).pointerState.position
    assert(pointerStatePos.x !== 0 && pointerStatePos.y !== 0)

    cleanup()
    assert(mockDomElm.listeners.length === 0, 'Callbacks were removed from canvas')
    assert(mockDocEvents.listeners.length === 0, 'Callbacks were removed from document')
    assert(mockWinEvents.listeners.length === 0, 'Callbacks were removed from window')
  })
})

describe('client input system reactor', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('test client input system reactor', async () => {
    const Reactor = SystemDefinitions.get(ClientInputSystem)!.reactor!
    const { rerender, unmount } = render(<Reactor />)
    unmount()
  })

  it('test client input system execute', async () => {
    const mockXRInputSource = new MockXRInputSource({
      handedness: 'left',
      targetRayMode: 'screen',
      targetRaySpace: new MockXRSpace() as XRSpace,
      gripSpace: undefined,
      gamepad: undefined,
      profiles: ['test'],
      hand: undefined
    }) as XRInputSource

    globalThis.ReferenceSpace.origin = new MockXRReferenceSpace()

    const mockXRFrame = new MockXRFrame()
    mockXRFrame.pose.transform.position.x = 0.2134
    mockXRFrame.pose.transform.position.y = 0.3456
    mockXRFrame.pose.transform.position.z = 0.2345
    mockXRFrame.pose.transform.orientation.x = 0.4567
    mockXRFrame.pose.transform.orientation.y = 0.8455
    mockXRFrame.pose.transform.orientation.z = 0.2454
    mockXRFrame.pose.transform.orientation.w = 0.2743

    const entity = Engine.instance.originEntity
    getMutableState(XRState).xrFrame.set(mockXRFrame as unknown as XRFrame)
    setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
    setComponent(entity, XRSpaceComponent, new MockXRSpace() as XRSpace)
    setComponent(entity, TransformComponent)
    const execute = SystemDefinitions.get(ClientInputSystem)!.execute!
    execute()

    const transformComponent = getComponent(entity, TransformComponent)
    assert(transformComponent.position.x === mockXRFrame.pose.transform.position.x)
    assert(transformComponent.position.y === mockXRFrame.pose.transform.position.y)
    assert(transformComponent.position.z === mockXRFrame.pose.transform.position.z)
    assert(transformComponent.rotation.x === mockXRFrame.pose.transform.orientation.x)
    assert(transformComponent.rotation.y === mockXRFrame.pose.transform.orientation.y)
    assert(transformComponent.rotation.z === mockXRFrame.pose.transform.orientation.z)
    assert(transformComponent.rotation.w === mockXRFrame.pose.transform.orientation.w)
  })

  it('test client input system XRUI heuristic', async () => {
    const mockXRInputSource = new MockXRInputSource({
      handedness: 'left',
      targetRayMode: 'screen',
      targetRaySpace: new MockXRSpace() as XRSpace,
      gripSpace: undefined,
      gamepad: undefined,
      profiles: ['test'],
      hand: undefined
    }) as XRInputSource

    const entity = Engine.instance.originEntity
    getMutableState(XRUIState).interactionRays.set([
      new Ray(new Vector3(0.23, 0.65, 0.98), new Vector3(0.21, 0.43, 0.82))
    ])

    class MockWebContainer {
      hitTest(inputRay) {
        return {
          intersection: {
            object: {
              visible: true,
              material: {
                opacity: 1
              }
            },
            distance: 1
          }
        }
      }
      destroy() {}
    }

    setComponent(entity, XRUIComponent, new MockWebContainer() as unknown as WebContainer3D)

    setComponent(entity, InputComponent)
    setComponent(entity, VisibleComponent)
    setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
    const execute = SystemDefinitions.get(ClientInputSystem)!.execute!
    execute()

    const sourceState = getComponent(entity, InputSourceComponent)
    assert(sourceState.assignedAxesEntity == entity)
    assert(sourceState.assignedButtonEntity == entity)
  })

  it('test client input system physics heuristic', async () => {
    const mockXRInputSource = new MockXRInputSource({
      handedness: 'left',
      targetRayMode: 'screen',
      targetRaySpace: new MockXRSpace() as XRSpace,
      gripSpace: undefined,
      gamepad: undefined,
      profiles: ['test'],
      hand: undefined
    }) as XRInputSource

    const entity = Engine.instance.originEntity

    getMutableState(PhysicsState).physicsWorld.set({
      castRayAndGetNormal: () => {
        return {
          collider: {
            parent: () => {
              return {
                userData: {
                  entity: entity
                }
              }
            }
          },
          toi: 0.5,
          normal: {
            x: 1,
            y: 1,
            z: 1
          }
        }
      }
    } as unknown as World)
    setComponent(entity, InputComponent)
    setComponent(entity, VisibleComponent)
    setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
    const execute = SystemDefinitions.get(ClientInputSystem)!.execute!
    execute()

    const sourceState = getComponent(entity, InputSourceComponent)
    assert(sourceState.assignedAxesEntity == entity)
    assert(sourceState.assignedButtonEntity == entity)
  })

  it('test client input system bounding box heuristic', async () => {
    const mockXRInputSource = new MockXRInputSource({
      handedness: 'left',
      targetRayMode: 'screen',
      targetRaySpace: new MockXRSpace() as XRSpace,
      gripSpace: undefined,
      gamepad: undefined,
      profiles: ['test'],
      hand: undefined
    }) as XRInputSource

    const entity = Engine.instance.originEntity

    setComponent(entity, BoundingBoxComponent)
    setComponent(entity, InputComponent)
    setComponent(entity, VisibleComponent)
    setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
    const execute = SystemDefinitions.get(ClientInputSystem)!.execute!
    execute()

    const sourceState = getComponent(entity, InputSourceComponent)
    assert(sourceState.assignedAxesEntity == 0)
    assert(sourceState.assignedButtonEntity == 0)
  })
})
