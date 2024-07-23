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
import React from 'react'
import sinon from 'sinon'

import {
  createEngine,
  createEntity,
  destroyEngine,
  Entity,
  getMutableComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@etherealengine/ecs'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { act, render } from '@testing-library/react'
import { Box3, Quaternion, Ray, Raycaster, Vector3 } from 'three'
import { EngineState } from '../../EngineState'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { assertFloatApproxNotEq, assertVecApproxEq } from '../../physics/classes/Physics.test'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { BodyTypes, SceneQueryType, Shapes } from '../../physics/types/PhysicsTypes'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { TransformComponent } from '../../SpatialModule'
import { BoundingBoxComponent } from '../../transform/components/BoundingBoxComponents'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { InputState } from '../state/InputState'
import ClientInputHeuristics, { HeuristicData, HeuristicFunctions, IntersectionData } from './ClientInputHeuristics'

function createDefaultRaycastArgs(): RaycastArgs {
  return {
    type: SceneQueryType.Closest,
    origin: new Vector3(),
    direction: new Vector3(),
    maxDistance: 1000,
    groups: getInteractionGroups(CollisionGroups.Default, CollisionGroups.Default),
    excludeRigidBody: undefined
  } as RaycastArgs
}

function createHeuristicDummyData(): HeuristicData {
  return {
    quaternion: new Quaternion(),
    raycast: createDefaultRaycastArgs(),
    ray: new Ray(),
    caster: new Raycaster(),
    hitTarget: new Vector3()
  } as HeuristicData
}

describe('ClientInputHeuristics', () => {
  describe('applyRaycastedInput', () => {
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

    it('should apply the editor heuristic only when EngineState.isEditing is true', () => {
      const spy = sinon.spy()
      const dummySpy = sinon.spy()
      const intersectionData = {} as Set<IntersectionData>
      const heuristicData = createHeuristicDummyData()
      const heuristicFunctions = {
        editor: spy as typeof ClientInputHeuristics.applyEditor,
        xrui: dummySpy as typeof ClientInputHeuristics.applyXRUI,
        physicsColliders: dummySpy as typeof ClientInputHeuristics.applyPhysicsColliders,
        bboxes: dummySpy as typeof ClientInputHeuristics.applyBBoxes,
        meshes: dummySpy as typeof ClientInputHeuristics.applyMeshes,
        proximity: dummySpy as typeof ClientInputHeuristics.applyProximity,
        raycastedInput: dummySpy as typeof ClientInputHeuristics.applyRaycastedInput
      } as HeuristicFunctions
      assert.equal(spy.called, false)
      assert.equal(getState(EngineState).isEditing, false)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.called, false)
      getMutableState(EngineState).isEditing.set(true)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.called, true)
    })

    it('should apply the XRUI heuristic only when EngineState.isEditing is false', () => {
      const spy = sinon.spy()
      const dummySpy = sinon.spy()
      const intersectionData = {} as Set<IntersectionData>
      const heuristicData = createHeuristicDummyData()
      const heuristicFunctions = {
        xrui: spy as typeof ClientInputHeuristics.applyXRUI,
        editor: dummySpy as typeof ClientInputHeuristics.applyEditor,
        physicsColliders: dummySpy as typeof ClientInputHeuristics.applyPhysicsColliders,
        bboxes: dummySpy as typeof ClientInputHeuristics.applyBBoxes,
        meshes: dummySpy as typeof ClientInputHeuristics.applyMeshes,
        proximity: dummySpy as typeof ClientInputHeuristics.applyProximity,
        raycastedInput: dummySpy as typeof ClientInputHeuristics.applyRaycastedInput
      } as HeuristicFunctions
      assert.equal(spy.called, false)
      assert.equal(getState(EngineState).isEditing, false)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 1)
      getMutableState(EngineState).isEditing.set(true)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      getMutableState(EngineState).isEditing.set(false)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 2)
    })

    it('should apply the PhysicsColliders heuristic only when EngineState.isEditing is false', () => {
      const spy = sinon.spy()
      const dummySpy = sinon.spy()
      const intersectionData = {} as Set<IntersectionData>
      const heuristicData = createHeuristicDummyData()
      const heuristicFunctions = {
        physicsColliders: spy as typeof ClientInputHeuristics.applyPhysicsColliders,
        editor: dummySpy as typeof ClientInputHeuristics.applyEditor,
        xrui: dummySpy as typeof ClientInputHeuristics.applyXRUI,
        bboxes: dummySpy as typeof ClientInputHeuristics.applyBBoxes,
        meshes: dummySpy as typeof ClientInputHeuristics.applyMeshes,
        proximity: dummySpy as typeof ClientInputHeuristics.applyProximity,
        raycastedInput: dummySpy as typeof ClientInputHeuristics.applyRaycastedInput
      } as HeuristicFunctions
      assert.equal(spy.called, false)
      assert.equal(getState(EngineState).isEditing, false)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 1)
      getMutableState(EngineState).isEditing.set(true)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      getMutableState(EngineState).isEditing.set(false)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 2)
    })

    it('should apply the BBoxes heuristic only when EngineState.isEditing is false', () => {
      const spy = sinon.spy()
      const dummySpy = sinon.spy()
      const intersectionData = {} as Set<IntersectionData>
      const heuristicData = createHeuristicDummyData()
      const heuristicFunctions = {
        bboxes: spy as typeof ClientInputHeuristics.applyBBoxes,
        editor: dummySpy as typeof ClientInputHeuristics.applyEditor,
        xrui: dummySpy as typeof ClientInputHeuristics.applyXRUI,
        physicsColliders: dummySpy as typeof ClientInputHeuristics.applyPhysicsColliders,
        meshes: dummySpy as typeof ClientInputHeuristics.applyMeshes,
        proximity: dummySpy as typeof ClientInputHeuristics.applyProximity,
        raycastedInput: dummySpy as typeof ClientInputHeuristics.applyRaycastedInput
      } as HeuristicFunctions
      assert.equal(spy.called, false)
      assert.equal(getState(EngineState).isEditing, false)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 1)
      getMutableState(EngineState).isEditing.set(true)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      getMutableState(EngineState).isEditing.set(false)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 2)
    })

    it('should always apply the Meshes heuristic', () => {
      const spy = sinon.spy()
      const dummySpy = sinon.spy()
      const intersectionData = {} as Set<IntersectionData>
      const heuristicData = createHeuristicDummyData()
      const heuristicFunctions = {
        meshes: spy as typeof ClientInputHeuristics.applyMeshes,
        editor: dummySpy as typeof ClientInputHeuristics.applyEditor,
        xrui: dummySpy as typeof ClientInputHeuristics.applyXRUI,
        physicsColliders: dummySpy as typeof ClientInputHeuristics.applyPhysicsColliders,
        bboxes: dummySpy as typeof ClientInputHeuristics.applyBBoxes,
        proximity: dummySpy as typeof ClientInputHeuristics.applyProximity,
        raycastedInput: dummySpy as typeof ClientInputHeuristics.applyRaycastedInput
      } as HeuristicFunctions
      assert.equal(spy.called, false)
      assert.equal(getState(EngineState).isEditing, false)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 1)
      getMutableState(EngineState).isEditing.set(true)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 2)
      getMutableState(EngineState).isEditing.set(false)
      ClientInputHeuristics.applyRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 3)
    })

    /**
    // @todo Do we care about testing these?
    // set the `@param quaternion` to the sourceEid.worldRotation
    // set the raycast direction to ObjectDirection.Forward rotated by sourceEid.worldRotation
    // set the `@param raycast`.direction as the origin+(direction scaled by -0.01)
    // set the ray to go from sourceEid.origin to raycast.direction
    // set the raycaster to go from sourceEid.origin to raycast.direction
    // set the scene layer in the raycaster
    */
  })

  describe('applyBBoxes', () => {
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

    describe('for every entity stored in the InputState.inputBoundingBoxes Set<Entity> ...', () => {
      it('... should not run if casting the `@param ray` towards `@param hitTarget` would not intersect the boundingBox of the entity', () => {
        setComponent(testEntity, BoundingBoxComponent)
        const inputState = getMutableState(InputState)
        inputState.inputBoundingBoxes.set(new Set([testEntity]))

        const rayOrigin = new Vector3()
        const rayDirection = new Vector3()
        const ray = new Ray(rayOrigin, rayDirection)
        const hitTarget = new Vector3()

        const data = new Set<IntersectionData>()

        ClientInputHeuristics.applyBBoxes(data, ray, hitTarget)
        assert.equal(data.size, 0)
      })

      it('... should not run if the entity does not have a BoundingBoxComponent', () => {
        // setComponent(testEntity, BoundingBoxComponent)  // Dont add the component this time
        const inputState = getMutableState(InputState)
        inputState.inputBoundingBoxes.set(new Set([testEntity]))

        const rayOrigin = new Vector3()
        const rayDirection = new Vector3(2, 2, 2)
        const ray = new Ray(rayOrigin, rayDirection)
        const hitTarget = new Vector3()
        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        ClientInputHeuristics.applyBBoxes(data, ray, hitTarget)
        assert.equal(data.size, 0)
      })

      it('... should add an entry to `@param intersectionData` containing the entity that was hit, and the distance to the hit (found with `ray.origin.distanceTo(hitTarget)`)', () => {
        const boxMin = new Vector3(1, 1, 1)
        const boxMax = new Vector3(3, 3, 3)
        const box = new Box3(boxMin, boxMax)

        setComponent(testEntity, BoundingBoxComponent)
        getMutableComponent(testEntity, BoundingBoxComponent).box.set(box)

        const inputState = getMutableState(InputState)
        inputState.inputBoundingBoxes.set(new Set([testEntity]))

        const rayOrigin = new Vector3()
        const rayDirection = new Vector3(2, 2, 2)
        const ray = new Ray(rayOrigin, rayDirection)
        const hitTarget = new Vector3()
        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        ClientInputHeuristics.applyBBoxes(data, ray, hitTarget)
        assertVecApproxEq(boxMin, hitTarget, 3)
        assert.equal(data.size, 1)
        const result = [...data]
        assert.equal(result[0].entity, testEntity)
        assertFloatApproxNotEq(result[0].distance, 0)
      })

      it('... should run as expected for all bounding boxes', () => {
        const otherEntity = createEntity()
        setComponent(otherEntity, TransformComponent)
        setComponent(otherEntity, VisibleComponent)
        type OwnedBox = { entity: Entity; box: Box3 }
        const box1Min = new Vector3(1.1, 1.1, 1.1)
        const box1Max = new Vector3(3.1, 3.1, 3.1)
        const box2Min = new Vector3(1.2, 1.2, 1.2)
        const box2Max = new Vector3(3.2, 3.2, 3.2)
        const box1 = new Box3(box1Min, box1Max)
        const box2 = new Box3(box2Min, box2Max)
        const boxes = [
          { entity: testEntity, box: box1 } as OwnedBox,
          { entity: otherEntity, box: box2 } as OwnedBox
        ] as OwnedBox[]

        for (const box of boxes) {
          setComponent(box.entity, BoundingBoxComponent)
          getMutableComponent(box.entity, BoundingBoxComponent).box.set(box.box)
        }

        const inputState = getMutableState(InputState)
        inputState.inputBoundingBoxes.set(new Set([testEntity, otherEntity]))

        const rayOrigin = new Vector3()
        const rayDirection = new Vector3(2, 2, 2)
        const ray = new Ray(rayOrigin, rayDirection)
        const hitTarget = new Vector3()
        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        ClientInputHeuristics.applyBBoxes(data, ray, hitTarget)
        assert.equal(data.size, boxes.length)
        const result = [...data]
        for (let id = 0; id < boxes.length; ++id) {
          assert.equal(result[id].entity, boxes[id].entity)
          assertFloatApproxNotEq(result[id].distance, 0)
        }
      })
    })
  })

  describe('applyPhysicsColliders', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add the hit.entity and hit.distance to the `@param intersectionData` for the first entity hit by the `@param raycast`', async () => {
      const physicsWorld = Physics.createWorld()
      physicsWorld!.timestep = 1 / 60
      getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)

      const data = new Set<IntersectionData>()
      const raycast = createDefaultRaycastArgs()
      raycast.origin.set(0, 0, 0)
      raycast.direction.set(2, 2, 2).normalize()

      const one = createEntity()
      setComponent(one, VisibleComponent)
      setComponent(one, EntityTreeComponent, { parentEntity: UndefinedEntity })
      setComponent(one, TransformComponent, { position: new Vector3(2.1, 2.1, 2.1) })
      setComponent(one, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(one, ColliderComponent, { shape: Shapes.Box })
      const two = createEntity() // Should not be hit by the raycast
      setComponent(two, VisibleComponent)
      setComponent(two, EntityTreeComponent, { parentEntity: UndefinedEntity })
      setComponent(two, TransformComponent, { position: new Vector3(2.2, 2.2, 2.2) })
      setComponent(two, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(two, ColliderComponent, { shape: Shapes.Box })

      const { rerender, unmount } = render(<></>)
      await act(() => rerender(<></>))
      getState(PhysicsState).physicsWorld.step()

      ClientInputHeuristics.applyPhysicsColliders(data, raycast)

      assert.notEqual(data.size, 0)
      assert.equal(data.size, 1)
      assert.equal([...data][0].entity, one)

      unmount()
    })

    it('should not do anything if there is no PhysicsState.physicsWorld', async () => {
      // Do not set PhysicsState.physicsWorld for this test
      // const physicsWorld = Physics.createWorld()
      // physicsWorld!.timestep = 1 / 60
      // getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)

      const data = new Set<IntersectionData>()
      const raycast = createDefaultRaycastArgs()
      raycast.origin.set(0, 0, 0)
      raycast.direction.set(2, 2, 2).normalize()

      const one = createEntity()
      setComponent(one, VisibleComponent)
      setComponent(one, EntityTreeComponent, { parentEntity: UndefinedEntity })
      setComponent(one, TransformComponent, { position: new Vector3(2.1, 2.1, 2.1) })
      setComponent(one, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(one, ColliderComponent, { shape: Shapes.Box })

      const { rerender, unmount } = render(<></>)
      await act(() => rerender(<></>))
      // getState(PhysicsState).physicsWorld.step() // Cannot step the physics if there is no physicsWorld

      ClientInputHeuristics.applyPhysicsColliders(data, raycast)

      assert.equal(data.size, 0)

      unmount()
    })

    it('should not do anything if the given `@param raycast` does not hit any entities in the current PhysicsState.physicsWorld', async () => {
      const physicsWorld = Physics.createWorld()
      physicsWorld!.timestep = 1 / 60
      getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)

      const data = new Set<IntersectionData>()
      const raycast = createDefaultRaycastArgs()
      raycast.origin.set(0, 0, 0)
      raycast.direction.set(-2, -2, -2).normalize() // Opposite direction of the entities location

      const one = createEntity()
      setComponent(one, VisibleComponent)
      setComponent(one, EntityTreeComponent, { parentEntity: UndefinedEntity })
      setComponent(one, TransformComponent, { position: new Vector3(42.1, 42.1, 42.1) })
      setComponent(one, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(one, ColliderComponent, { shape: Shapes.Box })
      const two = createEntity() // Should not be hit by the raycast
      setComponent(two, VisibleComponent)
      setComponent(two, EntityTreeComponent, { parentEntity: UndefinedEntity })
      setComponent(two, TransformComponent, { position: new Vector3(42.2, 42.2, 42.2) })
      setComponent(two, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(two, ColliderComponent, { shape: Shapes.Box })

      const { rerender, unmount } = render(<></>)
      await act(() => rerender(<></>))
      getState(PhysicsState).physicsWorld.step()

      ClientInputHeuristics.applyPhysicsColliders(data, raycast)

      assert.equal(data.size, 0)

      unmount()
    })
  })

  describe('applyMeshes', () => {
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

    describe('when `@param isEditing` is true ...', () => {
      // when `@param isEditing` is true ...
      // ... for the GroupComponents of all entities in the `meshesQuery()` that have a GroupComponent
    })

    describe('when `@param isEditing` is false ...', () => {
      // when `@param isEditing` is false ...
      // ... for the objects contained in the GroupComponents, of all entities in the Array.from(InputState.inputMeshes) that have a GroupComponent
      // ... for all hits of `@param caster`.intersectObjects( objects, recursive )
    })

    /**
    // @todo ?? For both of the above describe(...) ??
    // it("should not do anything if the object hit does not have an entity or an ancestor with an entity", () => {})
    // it("should add the parentObject.entity and hit.distance to the `@param intersectionData` for every object hit by the `@param caster`", () => {})
    */
  })

  /**
  // @todo
  describe("applyProximity", () => {
    // if XRControlState.isCameraAttachedToAvatar and `@param isSpatialInput`,
    //   then inputSourceEntity should be `@param sourceEid`
    //   else it should be the avatar of the current User
    // shouldn't do anything if we didn't find a valid inputSourceEntity
    // get the position of the inputSourceEntity into the global _worldPosInputSourceComponent vector
    // for every spatialInputObject
      // skip the User avatar's entity
      // get the position of the inputEntity into the global _worldPosInputComponent vector
      // compute the distance from the inputSourceEntity to the inputEntity
      // If the distance is within the proximity threshold
        // should store the inputEntity and the distanceSquared to the inputSourceEntity into the intersectionData
  })

  // (raycasted)
  describe("applyEditor", () => {
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

  // (raycasted)
  describe("applyXRUI", () => {
    // for every entity of xruiQuery ...
      // get the XRUIComponent of the entity, and do a WebContainer3D.hitTest with the `@param ray`
      // should not do anything if ...
      // ... we didn't hit anything
      // ... we hit something, but its intersection.object is not marked as visible
      // ... we hit something, but the material.opacity of the its intersection.object is less than 0.01
      // should add the xruiQuery.entity and layerHit.intersection.distance to the `@param intersectionData`
      //   for every object hit by the `@param caster`
  })

  */
})
