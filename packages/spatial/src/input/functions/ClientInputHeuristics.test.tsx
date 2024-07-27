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
import { Box3, BoxGeometry, Mesh, Quaternion, Ray, Raycaster, Vector3 } from 'three'
import { createMockXRUI } from '../../../tests/util/MockXRUI'
import { EngineState } from '../../EngineState'
import { initializeSpatialEngine } from '../../initializeEngine'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { assertFloatApproxEq, assertFloatApproxNotEq, assertVecApproxEq } from '../../physics/classes/Physics.test'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { BodyTypes, SceneQueryType, Shapes } from '../../physics/types/PhysicsTypes'
import { addObjectToGroup, GroupComponent } from '../../renderer/components/GroupComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { TransformComponent } from '../../SpatialModule'
import { BoundingBoxComponent } from '../../transform/components/BoundingBoxComponents'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { TransformGizmoTagComponent } from '../../transform/components/TransformComponent'
import { InputComponent } from '../components/InputComponent'
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
  describe('findRaycastedInput', () => {
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
        editor: spy as typeof ClientInputHeuristics.findEditor,
        xrui: dummySpy as typeof ClientInputHeuristics.findXRUI,
        physicsColliders: dummySpy as typeof ClientInputHeuristics.findPhysicsColliders,
        bboxes: dummySpy as typeof ClientInputHeuristics.findBBoxes,
        meshes: dummySpy as typeof ClientInputHeuristics.findMeshes,
        proximity: dummySpy as typeof ClientInputHeuristics.findProximity,
        raycastedInput: dummySpy as typeof ClientInputHeuristics.findRaycastedInput
      } as HeuristicFunctions
      assert.equal(spy.called, false)
      assert.equal(getState(EngineState).isEditing, false)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.called, false)
      getMutableState(EngineState).isEditing.set(true)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.called, true)
    })

    it('should apply the XRUI heuristic only when EngineState.isEditing is false', () => {
      const spy = sinon.spy()
      const dummySpy = sinon.spy()
      const intersectionData = {} as Set<IntersectionData>
      const heuristicData = createHeuristicDummyData()
      const heuristicFunctions = {
        xrui: spy as typeof ClientInputHeuristics.findXRUI,
        editor: dummySpy as typeof ClientInputHeuristics.findEditor,
        physicsColliders: dummySpy as typeof ClientInputHeuristics.findPhysicsColliders,
        bboxes: dummySpy as typeof ClientInputHeuristics.findBBoxes,
        meshes: dummySpy as typeof ClientInputHeuristics.findMeshes,
        proximity: dummySpy as typeof ClientInputHeuristics.findProximity,
        raycastedInput: dummySpy as typeof ClientInputHeuristics.findRaycastedInput
      } as HeuristicFunctions
      assert.equal(spy.called, false)
      assert.equal(getState(EngineState).isEditing, false)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 1)
      getMutableState(EngineState).isEditing.set(true)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      getMutableState(EngineState).isEditing.set(false)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 2)
    })

    it('should apply the PhysicsColliders heuristic only when EngineState.isEditing is false', () => {
      const spy = sinon.spy()
      const dummySpy = sinon.spy()
      const intersectionData = {} as Set<IntersectionData>
      const heuristicData = createHeuristicDummyData()
      const heuristicFunctions = {
        physicsColliders: spy as typeof ClientInputHeuristics.findPhysicsColliders,
        editor: dummySpy as typeof ClientInputHeuristics.findEditor,
        xrui: dummySpy as typeof ClientInputHeuristics.findXRUI,
        bboxes: dummySpy as typeof ClientInputHeuristics.findBBoxes,
        meshes: dummySpy as typeof ClientInputHeuristics.findMeshes,
        proximity: dummySpy as typeof ClientInputHeuristics.findProximity,
        raycastedInput: dummySpy as typeof ClientInputHeuristics.findRaycastedInput
      } as HeuristicFunctions
      assert.equal(spy.called, false)
      assert.equal(getState(EngineState).isEditing, false)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 1)
      getMutableState(EngineState).isEditing.set(true)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      getMutableState(EngineState).isEditing.set(false)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 2)
    })

    it('should apply the BBoxes heuristic only when EngineState.isEditing is false', () => {
      const spy = sinon.spy()
      const dummySpy = sinon.spy()
      const intersectionData = {} as Set<IntersectionData>
      const heuristicData = createHeuristicDummyData()
      const heuristicFunctions = {
        bboxes: spy as typeof ClientInputHeuristics.findBBoxes,
        editor: dummySpy as typeof ClientInputHeuristics.findEditor,
        xrui: dummySpy as typeof ClientInputHeuristics.findXRUI,
        physicsColliders: dummySpy as typeof ClientInputHeuristics.findPhysicsColliders,
        meshes: dummySpy as typeof ClientInputHeuristics.findMeshes,
        proximity: dummySpy as typeof ClientInputHeuristics.findProximity,
        raycastedInput: dummySpy as typeof ClientInputHeuristics.findRaycastedInput
      } as HeuristicFunctions
      assert.equal(spy.called, false)
      assert.equal(getState(EngineState).isEditing, false)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 1)
      getMutableState(EngineState).isEditing.set(true)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      getMutableState(EngineState).isEditing.set(false)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 2)
    })

    it('should always apply the Meshes heuristic', () => {
      const spy = sinon.spy()
      const dummySpy = sinon.spy()
      const intersectionData = {} as Set<IntersectionData>
      const heuristicData = createHeuristicDummyData()
      const heuristicFunctions = {
        meshes: spy as typeof ClientInputHeuristics.findMeshes,
        editor: dummySpy as typeof ClientInputHeuristics.findEditor,
        xrui: dummySpy as typeof ClientInputHeuristics.findXRUI,
        physicsColliders: dummySpy as typeof ClientInputHeuristics.findPhysicsColliders,
        bboxes: dummySpy as typeof ClientInputHeuristics.findBBoxes,
        proximity: dummySpy as typeof ClientInputHeuristics.findProximity,
        raycastedInput: dummySpy as typeof ClientInputHeuristics.findRaycastedInput
      } as HeuristicFunctions
      assert.equal(spy.called, false)
      assert.equal(getState(EngineState).isEditing, false)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 1)
      getMutableState(EngineState).isEditing.set(true)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
      assert.equal(spy.callCount, 2)
      getMutableState(EngineState).isEditing.set(false)
      ClientInputHeuristics.findRaycastedInput(testEntity, intersectionData, heuristicData, heuristicFunctions)
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

  describe('findBBoxes', () => {
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

        // Run and check that nothing was added
        ClientInputHeuristics.findBBoxes(data, ray, hitTarget)
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

        // Run and check that nothing was added
        ClientInputHeuristics.findBBoxes(data, ray, hitTarget)
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

        ClientInputHeuristics.findBBoxes(data, ray, hitTarget)
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

        ClientInputHeuristics.findBBoxes(data, ray, hitTarget)
        assert.equal(data.size, boxes.length)
        const result = [...data]
        for (let id = 0; id < boxes.length; ++id) {
          assert.equal(result[id].entity, boxes[id].entity)
          assertFloatApproxNotEq(result[id].distance, 0)
        }
      })
    })
  })

  describe('findPhysicsColliders', () => {
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

      ClientInputHeuristics.findPhysicsColliders(data, raycast)

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

      // Run and check that nothing was added
      ClientInputHeuristics.findPhysicsColliders(data, raycast)
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

      // Run and check that nothing was added
      ClientInputHeuristics.findPhysicsColliders(data, raycast)
      assert.equal(data.size, 0)

      unmount()
    })
  })

  describe('findMeshes', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    describe('when `@param isEditing` is true ...', () => {
      const Editing = true
      it('should add the parentObject.entity and hit.distance to the `@param intersectionData` for every object that has a MeshComponent and a VisibleComponent and is hit by the `@param caster`', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)
        const KnownEntities = [one, two]

        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()
        const raycaster = new Raycaster(rayOrigin, rayDirection)

        ClientInputHeuristics.findMeshes(data, Editing, raycaster)
        assert.notEqual(data.size, 0)
        for (const hit of [...data]) {
          assert.equal(KnownEntities.includes(hit.entity), true)
          assertFloatApproxNotEq(hit.distance, 0)
        }
      })

      it('should not do anything if the object hit does not have an entity or an ancestor with an entity', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)

        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3.5, 3.5, 3.5).normalize()
        const raycaster = new Raycaster(rayOrigin, rayDirection)

        // Remove the ancestor so that the `if (!parentObject) continue` code branch is hit
        box1.entity = undefined! as Entity
        box2.entity = undefined! as Entity
        // Run and check that nothing was added
        ClientInputHeuristics.findMeshes(data, Editing, raycaster)
        assert.equal(data.size, 0)
      })
    })

    describe('when `@param isEditing` is false ...', () => {
      const Editing = false
      it('should add the parentObject.entity and hit.distance to the `@param intersectionData` for every object in the InputState.inputMeshes.GroupComponent and is hit by the `@param caster`', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        // setComponent(one, VisibleComponent)  // Do not make it visible, so it doesn't hit the meshesQuery
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        // setComponent(two, VisibleComponent)  // Do not make it visible, so it doesn't hit the meshesQuery
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)
        const KnownEntities = [one, two]
        getMutableState(InputState).inputMeshes.set(new Set(KnownEntities))

        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()
        const raycaster = new Raycaster(rayOrigin, rayDirection)

        ClientInputHeuristics.findMeshes(data, Editing, raycaster)
        assert.notEqual(data.size, 0)
        for (const hit of [...data]) {
          assert.equal(KnownEntities.includes(hit.entity), true)
          assertFloatApproxNotEq(hit.distance, 0)
        }
      })

      it('should not do anything if the object hit does not have an entity or an ancestor with an entity', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        // setComponent(one, VisibleComponent)  // Do not make it visible, so it doesn't hit the meshesQuery
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        // setComponent(two, VisibleComponent)  // Do not make it visible, so it doesn't hit the meshesQuery
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)
        const KnownEntities = [one, two]
        getMutableState(InputState).inputMeshes.set(new Set(KnownEntities))

        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()
        const raycaster = new Raycaster(rayOrigin, rayDirection)

        // Remove the ancestor so that the `if (!parentObject) continue` code branch is hit
        box1.entity = undefined! as Entity
        box2.entity = undefined! as Entity
        // Run and check that nothing was added
        ClientInputHeuristics.findMeshes(data, Editing, raycaster)
        assert.equal(data.size, 0)
      })
    })
  })

  describe('findEditor', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    describe('if there are gizmoPickerObjects ...', () => {
      // objects will be the combined GroupComponent arrays of all gizmoPickerObjectsQuery entities

      it('... should enable the ObjectLayers.TransformGizmo layer in raycaster.layers', () => {
        const testEntity = createEntity()
        setComponent(testEntity, InputComponent)
        setComponent(testEntity, GroupComponent)
        setComponent(testEntity, VisibleComponent)
        setComponent(testEntity, TransformGizmoTagComponent)

        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()
        const raycaster = new Raycaster(rayOrigin, rayDirection)

        assert.equal(raycaster.layers.isEnabled(ObjectLayers.TransformGizmo), false)
        ClientInputHeuristics.findEditor(data, raycaster)
        assert.equal(raycaster.layers.isEnabled(ObjectLayers.TransformGizmo), true)
      })

      it('... should add the parentObject.entity and hit.distance to the `@param intersectionData` for every gizmoPickerObject hit by the `@param caster`', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        setComponent(one, InputComponent)
        setComponent(one, TransformGizmoTagComponent)

        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)
        setComponent(two, InputComponent)
        setComponent(two, TransformGizmoTagComponent)

        const box3 = new Mesh(new BoxGeometry(2, 2, 2))
        const three = createEntity()
        setComponent(three, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(three, VisibleComponent)
        setComponent(three, MeshComponent, box3)
        setComponent(three, GroupComponent)
        addObjectToGroup(three, box3)
        setComponent(three, InputComponent)
        // setComponent(three, TransformGizmoTagComponent)  // Do not add three to the gizmoPickerObject query

        const KnownEntities = [one, two]

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()
        const raycaster = new Raycaster(rayOrigin, rayDirection)

        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        ClientInputHeuristics.findEditor(data, raycaster)
        assert.notEqual(data.size, 0)
        const result = [...data]
        for (const hit of result) {
          assert.equal(KnownEntities.includes(hit.entity), true)
          assertFloatApproxNotEq(hit.distance, 0)
          assert.notEqual(hit.entity, three)
        }
      })

      it('... should not do anything if the ancestor object we found does not belong to an entity', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        setComponent(one, InputComponent)
        setComponent(one, TransformGizmoTagComponent)

        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)
        setComponent(two, InputComponent)
        setComponent(two, TransformGizmoTagComponent)

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()
        const raycaster = new Raycaster(rayOrigin, rayDirection)

        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        // Remove the ancestor so that the `if (!parentObject) continue` code branch is hit
        box1.entity = undefined! as Entity
        box2.entity = undefined! as Entity
        // Run and check that nothing was added
        ClientInputHeuristics.findEditor(data, raycaster)
        assert.equal(data.size, 0)
      })
    })

    describe('if there are no gizmoPickerObjects ...', () => {
      // objects will be the combined GroupComponent arrays of the inputObjectsQuery entities

      it('... should disable the ObjectLayers.TransformGizmo layer in raycaster.layers', () => {
        const testEntity = createEntity()
        setComponent(testEntity, InputComponent)
        setComponent(testEntity, GroupComponent)
        setComponent(testEntity, VisibleComponent)
        // setComponent(testEntity, TransformGizmoTagComponent)  // Do not enable, so that the gizmoPicker.length branch of the code is hit

        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()
        const raycaster = new Raycaster(rayOrigin, rayDirection)
        raycaster.layers.enable(ObjectLayers.TransformGizmo)

        assert.equal(raycaster.layers.isEnabled(ObjectLayers.TransformGizmo), true)
        ClientInputHeuristics.findEditor(data, raycaster)
        assert.equal(raycaster.layers.isEnabled(ObjectLayers.TransformGizmo), false)
      })

      it('... should add the parentObject.entity and hit.distance to the `@param intersectionData` for every inputrObject hit by the `@param caster`', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        setComponent(one, InputComponent)
        // setComponent(one, TransformGizmoTagComponent)  // Do not enable, so that we are on the inputObjects branch of the code

        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)
        setComponent(two, InputComponent)
        // setComponent(two, TransformGizmoTagComponent)  // Do not enable, so that we are on the inputObjects branch of the code

        const box3 = new Mesh(new BoxGeometry(2, 2, 2))
        const three = createEntity()
        setComponent(three, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(three, VisibleComponent)
        setComponent(three, MeshComponent, box3)
        setComponent(three, GroupComponent)
        addObjectToGroup(three, box3)
        // setComponent(three, InputComponent)  // Do not add the InputComponent, so that it is not part of inputObjectsQuery

        const KnownEntities = [one, two]

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()
        const raycaster = new Raycaster(rayOrigin, rayDirection)

        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        ClientInputHeuristics.findEditor(data, raycaster)
        assert.notEqual(data.size, 0)
        const result = [...data]
        for (const hit of result) {
          assert.equal(KnownEntities.includes(hit.entity), true)
          assertFloatApproxNotEq(hit.distance, 0)
          assert.notEqual(hit.entity, three)
        }
      })

      it('... should not do anything if the ancestor object we found does not belong to an entity', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        setComponent(one, InputComponent)
        // setComponent(one, TransformGizmoTagComponent)  // Do not enable, so that we are on the inputObjects branch of the code

        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)
        setComponent(two, InputComponent)
        // setComponent(two, TransformGizmoTagComponent)  // Do not enable, so that we are on the inputObjects branch of the code

        const box3 = new Mesh(new BoxGeometry(2, 2, 2))
        const three = createEntity()
        setComponent(three, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(three, VisibleComponent)
        setComponent(three, MeshComponent, box3)
        setComponent(three, GroupComponent)
        addObjectToGroup(three, box3)
        // setComponent(three, InputComponent)  // Do not add the InputComponent, so that it is not part of inputObjectsQuery

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()
        const raycaster = new Raycaster(rayOrigin, rayDirection)

        const data = new Set<IntersectionData>()
        assert.equal(data.size, 0)

        // Remove the ancestor so that the `if (!parentObject) continue` code branch is hit
        box1.entity = undefined! as Entity
        box2.entity = undefined! as Entity
        // Run and check that nothing was added
        ClientInputHeuristics.findEditor(data, raycaster)
        assert.equal(data.size, 0)
      })
    })
  })

  describe('findXRUI', () => {
    beforeEach(async () => {
      createEngine()
      initializeSpatialEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should add the xruiQuery.entity and intersection.distance to the `@param intersectionData`', () => {
      const testEntity = createEntity()
      setComponent(testEntity, VisibleComponent)
      createMockXRUI(testEntity, 1)

      const data = new Set<IntersectionData>()
      assert.equal(data.size, 0)

      const rayOrigin = new Vector3(0, 0, 0)
      const rayDirection = new Vector3(0, 0, -1).normalize()
      const ray = new Ray(rayOrigin, rayDirection)

      ClientInputHeuristics.findXRUI(data, ray)
      assert.notEqual(data.size, 0)
      const result = [...data]
      assert.equal(result[0].entity, testEntity)
      assertFloatApproxEq(result[0].distance, 0)
    })

    it("should not do anything if we didn't hit the WebContainer3D", () => {
      const testEntity = createEntity()
      setComponent(testEntity, VisibleComponent)
      createMockXRUI(testEntity, 1)

      const data = new Set<IntersectionData>()
      assert.equal(data.size, 0)

      const rayOrigin = new Vector3(10, 10, 10)
      const rayDirection = new Vector3(0, 0, -1).normalize()
      const ray = new Ray(rayOrigin, rayDirection)

      ClientInputHeuristics.findXRUI(data, ray)
      assert.equal(data.size, 0)
    })
  })

  describe('findProximity', () => {})

  /**
  // @todo
  describe("findProximity", () => {
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
    // create an array of all entities from intersectionData (aka closestEntities)
    // don't do anything else if the closestEntities array has no entities
    // sort the array of entities by distance if there is more than 1, prioritizing entities with an InteractableComponent
    // should add the closest (entity,distance) from the list (aka closetsEntities[0]) to the `@param sortedIntersections` array
  })
  */
})
