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
import sinon from 'sinon'

import {
  Entity,
  InputSystemGroup,
  SystemDefinitions,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { InputComponent } from '../components/InputComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import ClientInputFunctions from '../functions/ClientInputFunctions'
import { ClientInputSystem } from './ClientInputSystem'

// describe('addClientInputListeners', () => {
//   let documentAddEvent
//   let documentRemoveEvent
//   let windowAddEvent
//   let windowRemoveEvent
//   let navigatorCopy

//   const mockDocEvents = new MockEventListener()
//   const mockWinEvents = new MockEventListener()

//   before(() => {
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

//   after(() => {
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
  describe('Fields', () => {
    const System = SystemDefinitions.get(ClientInputSystem)

    it('should initialize the ClientInputSystem.uuid field with the expected value', () => {
      assert.equal(System!.uuid, 'ee.engine.input.ClientInputSystem')
    })

    it('should initialize the ClientInputSystem.insert field with the expected value', () => {
      assert.notEqual(System!.insert, undefined)
      assert.notEqual(System!.insert!.before, undefined)
      assert.equal(System!.insert!.before!, InputSystemGroup)
    })
  })

  /**
  // @todo
  describe('execute', () => {})
  describe('reactor', () => {})
  */
})

describe('ClientInputSystem: PRIVATE', () => {
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
      PRIVATE.preventDefaultKeyDown(Event)
      assert.equal(eventSpy.called, false)
      document.activeElement?.tagName = 'TEXTAREA'
      PRIVATE.preventDefaultKeyDown(Event)
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

  /**
  // @todo
  // reactor
  describe("inputRaycast", () => {})
  describe("useNonSpatialInputSources", () => {})
  describe("useGamepadInputSources", () => {})
  describe("CanvasInputReactor", () => {})
  describe("useXRInputSources", () => {})

  // execute
  describe("assignInputSources", () => {})
  describe("applyRaycastedInputHeuristics", () => {
    // todo??
    // set the `@param quaternion` to the sourceEid.worldRotation
    // set the raycast direction to ObjectDirection.Forward rotated by sourceEid.worldRotation
    // set the `@param raycast`.direction as the origin+(direction scaled by -0.01)
    // set the ray to go from sourceEid.origin to raycast.direction
    // set the raycaster to go from sourceEid.origin to raycast.direction
    // set the scene layer in the raycaster
    // test cases
    // should apply the editor heuristic only when EngineState.isEditing is true
    // should apply the XRUI heuristic only when EngineState.isEditing is false
    // should apply the PhysicsColliders heuristic only when EngineState.isEditing is false
    // should apply the BBoxes heuristic only when EngineState.isEditing is false
    // should always apply the Meshes heuristic
  })
  describe("applyHeuristicProximity", () => {})

  describe("applyHeuristicEditor", () => {
    // Find the list of gizmoPickerObjects.entity for the gizmo heuristic    (Input, Visible, Group, TransformGizmo)
    // Find the list of inputObjects  (Input, Visible, Group)
    // if there are gizmoPickerObjects,
    //   objects will be their GroupComponent arrays combined
    //   the raycaster will enable ObjectLayers.TransformGizmo
    // else:
    //   objects will be the combined GroupComponent arrays of the inputObjects list
    //   the raycaster will disable ObjectLayers.TransformGizmo
    // ... for all hits of `@param caster`.intersectObjects( objects, recursive )
      // find the first ancestor of the object hit that doesn't have a parent
      // should not do anything if the ancestor object we found does not belong to an entity
      // should add the parentObject.entity and hit.distance to the `@param intersectionData` for every object hit by the `@param caster`
  })

  // execute.(smaller functions)
  describe("applyHeuristicXRUI", () => {
    // for every entity of xruiQuery ...
      // get the XRUIComponent of the entity, and do a WebContainer3D.hitTest with the `@param ray`
      // should not do anything if ...
      // ... we didn't hit anything
      // ... we hit something, but its intersection.object is not marked as visible
      // ... we hit something, but the material.opacity of the its intersection.object is less than 0.01
      // should add the xruiQuery.entity and layerHit.intersection.distance to the `@param intersectionData`
      //   for every object hit by the `@param caster`
  })
  describe("applyHeuristicPhysicsColliders", () => {
    it("should not do anything if there is no PhysicsState.physicsWorld", () => {})
    it("should not do anything if the given `@param raycast` does not hit any entities in the current PhysicsState.physicsWorld", () => {})
    it("should add the hit.entity and hit.distance to the `@param intersectionData` for every hit of the `@param raycast`", () => {})
  })
  describe("applyHeuristicBBoxes", () => {
    describe("for every entity stored in the InputState.inputBoundingBoxes Set<Entity> ...", () => {
      it("... should not run if the entity does not have a BoundingBoxComponent", () => {})
      it("... should not run if casting the `@param ray` towards `@param hitTarget` would not intersect the boundingBox of the entity", () => {})
      it("... should add an entry to `@param intersectionData` containing the entity that was hit, and the distance to the hit (found with `ray.origin.distanceTo(hitTarget)`)", () => {})
    })
  })
  describe("applyHeuristicMeshes", () => {
    // when `@param isEditing` is true ...
    // ... for the GroupComponents of all entities in the `meshesQuery()` that have a GroupComponent
    // when `@param isEditing` is false ...
    // ... for the objects contained in the GroupComponents, of all entities in the Array.from(InputState.inputMeshes) that have a GroupComponent
    // ... for all hits of `@param caster`.intersectObjects( objects, recursive )
      // should not do anything if the object hit does not have an entity or an ancestor with an entity
      // should add the parentObject.entity and hit.distance to the `@param intersectionData` for every object hit by the `@param caster`", () => {})
  })
  */
})
