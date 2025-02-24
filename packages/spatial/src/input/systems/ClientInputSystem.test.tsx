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

import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  createEngine,
  createEntity,
  destroyEngine,
  Entity,
  entityExists,
  getComponent,
  getMutableComponent,
  hasComponent,
  InputSystemGroup,
  PresentationSystemGroup,
  removeEntity,
  setComponent,
  SystemDefinitions,
  UndefinedEntity
} from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { assertVec } from '../../../tests/util/assert'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { XRState } from '../../xr/XRState'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import { ClientInputCleanupSystem, ClientInputSystem } from './ClientInputSystem'

// describe('addClientInputListeners', () => {
//   let documentAddEvent
//   let documentRemoveEvent
//   let windowAddEvent
//   let windowRemoveEvent
//   let navigatorCopy

//   const mockDocEvents = new MockEventListener()
//   const mockWinEvents = new MockEventListener()

//   beforeAll(() => {
//     documentAddEvent = globalThis.document.addEventListener
//     documentRemoveEvent = globalThis.document.removeEventListener
//     windowAddEvent = globalThis.window.addEventListener
//     windowRemoveEvent = globalThis.window.removeEventListener
//     navigatorCopy = globalThis.navigator

//     globalThis.document.addEventListener = mockDocEvents.addEventListener as any
//     globalThis.document.removeEventListener = mockDocEvents.removeEventListener as any
//     globalThis.window.addEventListener = mockWinEvents.addEventListener as any
//     globalThis.window.removeEventListener = mockWinEvents.removeEventListener as any
//     Object.defineProperty(globalThis, 'navigator', { value: new MockNavigator() as any })
//     globalThis.ReferenceSpace.origin = new MockXRReferenceSpace()
//   })

//   afterAll(() => {
//     globalThis.document.addEventListener = documentAddEvent
//     globalThis.document.removeEventListener = documentRemoveEvent
//     globalThis.window.addEventListener = windowAddEvent
//     globalThis.window.removeEventListener = windowRemoveEvent
//     Object.defineProperty(globalThis, 'navigator', { value: navigatorCopy })
//   })

//   beforeEach(() => {
//     createEngine()
//     EngineRenderer.instance = new MockEngineRenderer()
//   })

//   afterEach(() => {
//     EngineRenderer.instance = undefined!
//     return destroyEngine()
//   })

//   it('should add client input listeners', () => {
//     const cleanup = addClientInputListeners()

//     assert(typeof cleanup === 'function')

//     const mock: MockEngineRenderer = EngineRenderer.instance as MockEngineRenderer
//     const mockDomElm = mock.renderer.domElement as unknown as MockEventListener
//     assert(mockDomElm.listeners.length > 0, 'Callbacks were added to canvas')
//     mockDomElm.listeners.forEach((listener) => {
//       listener(mockEvent)
//     })

//     assert(mockDocEvents.listeners.length > 0, 'Callbacks were added to document')
//     mockDocEvents.listeners.forEach((listener) => {
//       listener(mockEvent)
//     })

//     assert(mockWinEvents.listeners.length > 0, 'Callbacks were added to window')
//     mockWinEvents.listeners.forEach((listener) => {
//       listener(mockEvent)
//     })

//     const entities = getAllEntities(HyperFlux.store)
//     const emulatedInputSourceEntity = entities[entities.length - 1] as Entity

//     assert(entityExists(emulatedInputSourceEntity))
//     assert(hasComponent(emulatedInputSourceEntity, InputSourceComponent))
//     assert(hasComponent(emulatedInputSourceEntity, NameComponent))

//     const pointerPosition = getComponent(pointerQuery()[0], InputPointerComponent).position
//     assert(pointerPosition.x !== 0 && pointerPosition.y !== 0)

//     cleanup()
//     assert(mockDomElm.listeners.length === 0, 'Callbacks were removed from canvas')
//     assert(mockDocEvents.listeners.length === 0, 'Callbacks were removed from document')
//     assert(mockWinEvents.listeners.length === 0, 'Callbacks were removed from window')
//   })
// })

describe('client input system reactor', () => {
  // beforeEach(() => {
  //   createEngine()
  // })
  // afterEach(() => {
  //   return destroyEngine()
  // })
  // it('test client input system reactor', async () => {
  //   const Reactor = SystemDefinitions.get(ClientInputSystem)!.reactor!
  //   const { rerender, unmount } = render(<Reactor />)
  //   unmount()
  // })
  // it('test client input system execute', async () => {
  //   const mockXRInputSource = new MockXRInputSource({
  //     handedness: 'left',
  //     targetRayMode: 'screen',
  //     targetRaySpace: new MockXRSpace() as XRSpace,
  //     gripSpace: undefined,
  //     gamepad: undefined,
  //     profiles: ['test'],
  //     hand: undefined
  //   }) as XRInputSource
  //   globalThis.ReferenceSpace.origin = new MockXRReferenceSpace()
  //   const mockXRFrame = new MockXRFrame()
  //   mockXRFrame.pose.transform.position.x = 0.2134
  //   mockXRFrame.pose.transform.position.y = 0.3456
  //   mockXRFrame.pose.transform.position.z = 0.2345
  //   mockXRFrame.pose.transform.orientation.x = 0.4567
  //   mockXRFrame.pose.transform.orientation.y = 0.8455
  //   mockXRFrame.pose.transform.orientation.z = 0.2454
  //   mockXRFrame.pose.transform.orientation.w = 0.2743
  //   const entity = Engine.instance.localFloorEntity
  //   getMutableState(XRState).xrFrame.set(mockXRFrame as unknown as XRFrame)
  //   setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
  //   setComponent(entity, XRSpaceComponent, new MockXRSpace() as XRSpace)
  //   setComponent(entity, TransformComponent)
  //   const execute = SystemDefinitions.get(ClientInputSystem)!.execute!
  //   execute()
  //   const transformComponent = getComponent(entity, TransformComponent)
  //   assert(transformComponent.position.x === mockXRFrame.pose.transform.position.x)
  //   assert(transformComponent.position.y === mockXRFrame.pose.transform.position.y)
  //   assert(transformComponent.position.z === mockXRFrame.pose.transform.position.z)
  //   assert(transformComponent.rotation.x === mockXRFrame.pose.transform.orientation.x)
  //   assert(transformComponent.rotation.y === mockXRFrame.pose.transform.orientation.y)
  //   assert(transformComponent.rotation.z === mockXRFrame.pose.transform.orientation.z)
  //   assert(transformComponent.rotation.w === mockXRFrame.pose.transform.orientation.w)
  // })
  // it('test client input system XRUI heuristic', async () => {
  //   const mockXRInputSource = new MockXRInputSource({
  //     handedness: 'left',
  //     targetRayMode: 'screen',
  //     targetRaySpace: new MockXRSpace() as XRSpace,
  //     gripSpace: undefined,
  //     gamepad: undefined,
  //     profiles: ['test'],
  //     hand: undefined
  //   }) as XRInputSource
  //   const entity = Engine.instance.localFloorEntity
  //   getMutableState(XRUIState).interactionRays.set([
  //     new Ray(new Vector3(0.23, 0.65, 0.98), new Vector3(0.21, 0.43, 0.82))
  //   ])
  //   class MockWebContainer {
  //     hitTest(inputRay) {
  //       return {
  //         intersection: {
  //           object: {
  //             visible: true,
  //             material: {
  //               opacity: 1
  //             }
  //           },
  //           distance: 1
  //         }
  //       }
  //     }
  //     destroy() {}
  //   }
  //   setComponent(entity, XRUIComponent, new MockWebContainer() as unknown as WebContainer3D)
  //   setComponent(entity, InputComponent)
  //   setComponent(entity, VisibleComponent)
  //   setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
  //   const execute = SystemDefinitions.get(ClientInputSystem)!.execute!
  //   execute()
  //   const sourceState = getComponent(entity, InputSourceComponent)
  //   assert(sourceState.assignedAxesEntity == entity)
  //   assert(sourceState.assignedButtonEntity == entity)
  // })
  // it('test client input system physics heuristic', async () => {
  //   const mockXRInputSource = new MockXRInputSource({
  //     handedness: 'left',
  //     targetRayMode: 'screen',
  //     targetRaySpace: new MockXRSpace() as XRSpace,
  //     gripSpace: undefined,
  //     gamepad: undefined,
  //     profiles: ['test'],
  //     hand: undefined
  //   }) as XRInputSource
  //   const entity = Engine.instance.localFloorEntity
  //   getMutableState(PhysicsState).physicsWorld.set({
  //     castRayAndGetNormal: () => {
  //       return {
  //         collider: {
  //           parent: () => {
  //             return {
  //               userData: {
  //                 entity: entity
  //               }
  //             }
  //           }
  //         },
  //         toi: 0.5,
  //         normal: {
  //           x: 1,
  //           y: 1,
  //           z: 1
  //         }
  //       }
  //     }
  //   } as unknown as World)
  //   setComponent(entity, InputComponent)
  //   setComponent(entity, VisibleComponent)
  //   setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
  //   const execute = SystemDefinitions.get(ClientInputSystem)!.execute!
  //   execute()
  //   const sourceState = getComponent(entity, InputSourceComponent)
  //   assert(sourceState.assignedAxesEntity == entity)
  //   assert(sourceState.assignedButtonEntity == entity)
  // })
  // it('test client input system bounding box heuristic', async () => {
  //   const mockXRInputSource = new MockXRInputSource({
  //     handedness: 'left',
  //     targetRayMode: 'screen',
  //     targetRaySpace: new MockXRSpace() as XRSpace,
  //     gripSpace: undefined,
  //     gamepad: undefined,
  //     profiles: ['test'],
  //     hand: undefined
  //   }) as XRInputSource
  //   const entity = Engine.instance.localFloorEntity
  //   setComponent(entity, BoundingBoxComponent)
  //   setComponent(entity, InputComponent)
  //   setComponent(entity, VisibleComponent)
  //   setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
  //   const execute = SystemDefinitions.get(ClientInputSystem)!.execute!
  //   execute()
  //   const sourceState = getComponent(entity, InputSourceComponent)
  //   assert(sourceState.assignedAxesEntity == 0)
  //   assert(sourceState.assignedButtonEntity == 0)
  // })
})

describe('ClientInputSystem', () => {
  const System = SystemDefinitions.get(ClientInputSystem)!

  describe('Fields', () => {
    it('should initialize the ClientInputSystem.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.input.ClientInputSystem')
    })

    it('should initialize the ClientInputSystem.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.before, undefined)
      assert.equal(System.insert!.before!, InputSystemGroup)
    })
  })

  describe('execute', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    const clientInputSystemExecute = System.execute

    it('should update the TransformComponent of every entity that matches the [XRSpaceComponent, TransformComponent] xrSpacesQuery, based on the data set in XRFrame.transform', () => {
      const position = new Vector3()
      const rotation = new Quaternion()
      setComponent(testEntity, XRSpaceComponent, { space: {} as XRSpace, baseSpace: {} as XRSpace })
      setComponent(testEntity, TransformComponent)
      getMutableState(XRState).xrFrame.set({
        getPose: () => {
          return { transform: { position: position, orientation: rotation } }
        }
      } as unknown as XRFrame)

      // Run and Check the result
      clientInputSystemExecute()
      const result = getComponent(testEntity, TransformComponent)
      assertVec.approxEq(result.position, position, 3)
      assertVec.approxEq(result.rotation, rotation, 4)
    })

    it('should remove any entities that match the query [InputPointerComponent, InputSourceComponent, Not(XRSpaceComponent)] when the InputPointerComponent.cameraEntity for that entity no longer exists (aka stalePointers)', () => {
      const cameraEntity = createEntity()
      const otherCameraEntity = createEntity()
      setComponent(cameraEntity, CameraComponent)
      setComponent(otherCameraEntity, CameraComponent)

      const one = createEntity()
      setComponent(one, InputPointerComponent, { pointerId: 1, cameraEntity: cameraEntity })
      setComponent(one, InputSourceComponent)
      assert.equal(hasComponent(one, XRSpaceComponent), false)
      const two = createEntity()
      setComponent(two, InputPointerComponent, { pointerId: 2, cameraEntity: cameraEntity })
      setComponent(two, InputSourceComponent)
      assert.equal(hasComponent(two, XRSpaceComponent), false)
      const three = createEntity()
      setComponent(three, InputPointerComponent, { pointerId: 3, cameraEntity: otherCameraEntity })
      setComponent(three, InputSourceComponent)
      assert.equal(hasComponent(three, XRSpaceComponent), false)

      const StaleEntities = [one, two] as Entity[]
      for (const entity of StaleEntities) assert.equal(entityExists(entity), true)
      assert.equal(entityExists(three), true)

      // Sanity check before running
      clientInputSystemExecute()
      for (const entity of StaleEntities) assert.equal(entityExists(entity), true)
      assert.equal(entityExists(three), true)

      // Run and Check the result
      removeEntity(cameraEntity)
      clientInputSystemExecute()
      for (const entity of StaleEntities) assert.equal(entityExists(entity), false)
      assert.equal(entityExists(three), true)
    })

    /**
    // @todo After the XRUI refactor is complete
    it("should set the XRUIComponent.interactionRays for every entity that matches the [VisibleComponent, XRUIComponent] xruiQuery, based on the data set in every InputSourceComponent", () => {})
    */
  })
})

describe('ClientInputCleanupSystem', () => {
  const System = SystemDefinitions.get(ClientInputCleanupSystem)!

  describe('Fields', () => {
    it('should initialize the ClientInputCleanupSystem.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.input.ClientInputCleanupSystem')
    })

    it('should initialize the ClientInputCleanupSystem.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.after, undefined)
      assert.equal(System.insert!.after!, PresentationSystemGroup)
    })
  })

  const clientInputCleanupSystemExecute = System.execute

  describe('execute', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should fill the InputSourceComponent.source.gamepad.axes array with 0s for every entity that has an InputSourceComponent, an InputPointerComponent and does not have an XRSpaceComponent', () => {
      const oneEntity = createEntity()
      const twoEntity = createEntity()
      const Initial = 42

      // Set the initial data from the conditions
      const EntityList = [testEntity, oneEntity, twoEntity] as Entity[]
      for (const entity of EntityList) {
        setComponent(entity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })
        setComponent(entity, InputSourceComponent)
      }

      // Set the expected data
      for (const entity of EntityList) {
        const gamepad = getMutableComponent(entity, InputSourceComponent).source.gamepad!
        for (let id = 0; id < gamepad?.value!.axes.length; ++id) {
          gamepad.set((value) => {
            // @ts-ignore Ignore the readonly property typecheck
            if (value) value.axes[id] = Initial
            return value
          })
        }
      }

      // Run and Check the result
      clientInputCleanupSystemExecute()
      for (const entity of EntityList) {
        assert.equal(hasComponent(entity, XRSpaceComponent), false)
        const Axes = getComponent(entity, InputSourceComponent).source.gamepad!.axes
        for (const axis of Axes) {
          assert.notEqual(axis, Initial)
          assert.equal(axis, 0)
        }
      }
    })

    it('should not do anything if the DOM is undefined', () => {
      const oneEntity = createEntity()
      const twoEntity = createEntity()
      const Initial = 42

      // Set the initial data from the conditions
      const EntityList = [testEntity, oneEntity, twoEntity] as Entity[]
      for (const entity of EntityList) {
        setComponent(entity, InputPointerComponent, { pointerId: 42, cameraEntity: createEntity() })
        setComponent(entity, InputSourceComponent)
      }

      // Set the expected data
      for (const entity of EntityList) {
        const gamepad = getMutableComponent(entity, InputSourceComponent).source.gamepad!
        for (let id = 0; id < gamepad?.value!.axes.length; ++id) {
          gamepad.set((value) => {
            // @ts-ignore Ignore the readonly property typecheck
            if (value) value.axes[id] = Initial
            return value
          })
        }
      }

      const DOMbackup = globalThis.document
      // @ts-ignore Force-assign undefined to the dom
      globalThis.document = undefined
      // Run and Check the result
      clientInputCleanupSystemExecute()
      for (const entity of EntityList) {
        assert.equal(hasComponent(entity, XRSpaceComponent), false)
        const Axes = getComponent(entity, InputSourceComponent).source.gamepad!.axes
        for (const axis of Axes) assert.equal(axis, Initial)
      }
      // Restore the DOM  (note: Other tests will break if this is not restored)
      globalThis.document = DOMbackup
    })
  })
})
