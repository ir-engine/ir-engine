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
import { afterEach, beforeEach, describe, it } from 'vitest'
import { boundingBoxHeuristic, findProximity, IntersectionData, meshHeuristic } from './ClientInputHeuristics'

import {
  createEngine,
  createEntity,
  destroyEngine,
  Engine,
  Entity,
  EntityUUID,
  getMutableComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { getMutableState, UserID } from '@ir-engine/hyperflux'
import { Box3, BoxGeometry, Mesh, Vector3 } from 'three'
import { assertFloat } from '../../../tests/util/assert'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { EngineState } from '../../EngineState'
import { destroySpatialEngine, destroySpatialViewer } from '../../initializeEngine'
import { addObjectToGroup, GroupComponent } from '../../renderer/components/GroupComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { BoundingBoxComponent } from '../../transform/components/BoundingBoxComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { XRState } from '../../xr/XRState'
import { InputComponent } from '../components/InputComponent'
import { InputState } from '../state/InputState'

describe('ClientInputHeuristics', () => {
  describe('findRaycastedInput', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, VisibleComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      destroySpatialViewer()
      return destroyEngine()
    })
  })

  describe('boundingBoxHeuristic', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, VisibleComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      destroySpatialViewer()
      return destroyEngine()
    })

    describe('for every entity stored in the InputState.inputBoundingBoxes Set<Entity> ...', () => {
      it('... should not run if casting the `@param ray` towards `@param hitTarget` would not intersect the boundingBox of the entity', () => {
        setComponent(testEntity, BoundingBoxComponent)
        const inputState = getMutableState(InputState)
        inputState.inputBoundingBoxes.set(new Set([testEntity]))

        const rayOrigin = new Vector3()
        const rayDirection = new Vector3()

        const data = new Set<IntersectionData>()

        // Run and check that nothing was added
        boundingBoxHeuristic(data, rayOrigin, rayDirection)
        assert.equal(data.size, 0)
      })

      it('... should not run if the entity does not have a BoundingBoxComponent', () => {
        // setComponent(testEntity, BoundingBoxComponent)  // Dont add the component this time
        const inputState = getMutableState(InputState)
        inputState.inputBoundingBoxes.set(new Set([testEntity]))

        const rayOrigin = new Vector3()
        const rayDirection = new Vector3(2, 2, 2)
        const data = new Set<IntersectionData>()

        // Run and check that nothing was added
        boundingBoxHeuristic(data, rayOrigin, rayDirection)
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

        const rayOrigin = new Vector3(0, 2, 2)
        const rayDirection = new Vector3(1, 0, 0).normalize()
        const data = new Set<IntersectionData>()

        boundingBoxHeuristic(data, rayOrigin, rayDirection)
        assertFloat.approxEq(1, Array.from(data)[0].distance)
        assert.equal(data.size, 1)
        const result = [...data]
        assert.equal(result[0].entity, testEntity)
        assertFloat.approxNotEq(result[0].distance, 0)
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
        const data = new Set<IntersectionData>()

        boundingBoxHeuristic(data, rayOrigin, rayDirection)
        assert.equal(data.size, boxes.length)
        const result = [...data]
        for (let id = 0; id < boxes.length; ++id) {
          assert.equal(result[id].entity, boxes[id].entity)
          assertFloat.approxNotEq(result[id].distance, 0)
        }
      })
    })
  })

  describe('meshHeuristic', () => {
    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
    })

    afterEach(() => {
      destroySpatialEngine()
      destroySpatialViewer()
      return destroyEngine()
    })

    describe('when `@param isEditing` is true ...', () => {
      it('should add the parentObject.entity and hit.distance to the `@param intersectionData` for every object that has a MeshComponent and a VisibleComponent and is hit by the `@param caster`', () => {
        const box1 = new Mesh(new BoxGeometry(0.5, 0.5, 0.5))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(1, 1, 1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        addObjectToGroup(one, box1)
        const box2 = new Mesh(new BoxGeometry(0.5, 0.5, 0.5))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(2, 2, 2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        addObjectToGroup(two, box2)
        const KnownEntities = [one, two]

        getMutableState(EngineState).isEditing.set(true)

        const data = new Set<IntersectionData>()

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(1, 1, 1).normalize()

        meshHeuristic(data, rayOrigin, rayDirection)
        /** @todo find out why there are 7 hits returned... */
        assert.notEqual(data.size, 0)
        for (const hit of [...data]) {
          assert.equal(KnownEntities.includes(hit.entity), true)
          assertFloat.approxNotEq(hit.distance, 0)
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

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3.5, 3.5, 3.5).normalize()

        // Remove the ancestor so that the `if (!parentObject) continue` code branch is hit
        box1.entity = undefined! as Entity
        box2.entity = undefined! as Entity
        // Run and check that nothing was added
        meshHeuristic(data, rayOrigin, rayDirection)
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

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()

        meshHeuristic(data, rayOrigin, rayDirection)
        assert.notEqual(data.size, 0)
        for (const hit of [...data]) {
          assert.equal(KnownEntities.includes(hit.entity), true)
          assertFloat.approxNotEq(hit.distance, 0)
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

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()

        // Remove the ancestor so that the `if (!parentObject) continue` code branch is hit
        box1.entity = undefined! as Entity
        box2.entity = undefined! as Entity
        // Run and check that nothing was added
        meshHeuristic(data, rayOrigin, rayDirection)
        assert.equal(data.size, 0)
      })
    })
  })

  describe('findProximity', () => {
    beforeEach(() => {
      createEngine()
      getMutableState(EngineState).userID.set('testUserID' as UserID)
      mockSpatialEngine()
    })

    afterEach(() => {
      destroySpatialEngine()
      destroySpatialViewer()
      return destroyEngine()
    })

    describe('when both XRState.isCameraAttachedToAvatar and `@param isSpatialInput` are truthy ...', () => {
      const isCameraAttachedToAvatar = true
      const isSpatialInput = true
      const avatarCameraMode = isCameraAttachedToAvatar ? 'attached' : 'auto'

      it('... should store the inputEntity and its distanceSquared to the inputSourceEntity into the `@param intersectionData` for every spatialInputObjectQuery entity that is within the proximity threshold', () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent)
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()

        const testEntity = createEntity()
        setComponent(testEntity, VisibleComponent)
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, InputComponent)
        // Run and Check the result
        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        const isStored = Boolean([...intersections].find((intersection) => intersection.entity === testEntity))
        assert.equal(isStored, true)
      })

      it("... should not store the User's avatar entity into the `@param intersectionData` set, even when there is an inputSourceEntity that is within the proximity threshold", () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent)
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()
        const UUID = (Engine.instance.userID + '_avatar') as EntityUUID
        const testEntity = createEntity()
        setComponent(testEntity, VisibleComponent)
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, InputComponent)
        setComponent(testEntity, UUIDComponent, UUID)
        // Run and Check the result
        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        const result = Boolean([...intersections].find((intersection) => intersection.entity === testEntity))
        assert.equal(result, false)
      })

      it('... should not find any intersections when `@param sourceEid` entity is undefined ', () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = UndefinedEntity
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()

        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        const result = intersections.size
        assert.equal(result, 0)
      })

      it('... should add the entity found to the first element of `@param sortedEntities` when there is only one entity within the proximity threshold', () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent, { position: new Vector3(1, 1, 1) })
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()
        const testEntity = createEntity()
        setComponent(testEntity, VisibleComponent)
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, InputComponent)

        // how to setup proximity threshold
        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        const afterOne = sorted.length
        assert.equal(afterOne, 1)
      })

      it('... should not add anything to `@param sortedEntities` if no entities were found within the proximity threshold', () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent, { position: new Vector3(42, 42, 42) })
        let sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()
        const testEntity = createEntity()
        setComponent(testEntity, VisibleComponent)
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, InputComponent)

        // how to setup proximity threshold
        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        const afterOne = sorted.length
        assert.equal(afterOne, 0)
        sorted = [] as IntersectionData[]

        setComponent(sourceEntity, TransformComponent, { position: new Vector3(1, 1, 1) })
        computeTransformMatrix(sourceEntity)
        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        const afterTwo = sorted.length
        assert.equal(afterTwo, 1)
      })

      it('... should sort the entities by distance and add the closest entity found to the first element of `@param sortedEntities` when there is more than one entity within the proximity threshold', () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent)
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()
        const testEntity1 = createEntity()
        const testEntity2 = createEntity()
        setComponent(testEntity1, TransformComponent, { position: new Vector3(1, 1, 1) })
        setComponent(testEntity1, VisibleComponent)
        setComponent(testEntity1, InputComponent)

        setComponent(testEntity2, TransformComponent, { position: new Vector3(42, 42, 42) })
        setComponent(testEntity2, VisibleComponent)
        setComponent(testEntity2, InputComponent)

        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        assert.equal(sorted.length, 1)
        for (const obj of sorted) assert.notEqual(obj.entity, testEntity2)
      })

      it('... should only add one entity to the `@param sortedEntities` list when multiple entities are found within the proximity threshold', () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent)
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()
        const testEntity1 = createEntity()
        const testEntity2 = createEntity()
        setComponent(testEntity1, TransformComponent, { position: new Vector3(0.5, 0.5, 0.5) })
        setComponent(testEntity1, VisibleComponent)
        setComponent(testEntity1, InputComponent)

        setComponent(testEntity2, TransformComponent, { position: new Vector3(1, 1, 1) })
        setComponent(testEntity2, VisibleComponent)
        setComponent(testEntity2, InputComponent)

        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        assert.equal(sorted.length, 1)
        for (const obj of sorted) assert.notEqual(obj.entity, testEntity2)
      })
    })

    describe('when XRControlsState.isCameraAttachedToAvatar is truthy and `@param isSpatialInput` is falsy ...', () => {
      const isCameraAttachedToAvatar = true
      const isSpatialInput = false
      const avatarCameraMode = isCameraAttachedToAvatar ? 'attached' : 'auto'

      it('... should not store the avatarEntity into the `@param intersectionData`', () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent)
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()

        const testEntity = createEntity()
        setComponent(testEntity, VisibleComponent)
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, InputComponent)
        // Make the entity the selfAvatarEntity
        getMutableState(EngineState).userID.set('testUserID' as UserID)
        const UUID = (Engine.instance.userID + '_avatar') as EntityUUID
        setComponent(testEntity, UUIDComponent, UUID)

        // Run and Check the result
        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        const isStored = Boolean([...intersections].find((intersection) => intersection.entity === testEntity))
        assert.equal(isStored, false)
      })

      it("... should not store the User's avatar entity into the `@param intersectionData` set, even when there is an inputSourceEntity that is within the proximity threshold", () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent)
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()

        const testEntity = createEntity()
        setComponent(testEntity, VisibleComponent)
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, InputComponent)
        // Make the entity the selfAvatarEntity
        getMutableState(EngineState).userID.set('testUserID' as UserID)
        const UUID = (Engine.instance.userID + '_avatar') as EntityUUID
        setComponent(testEntity, UUIDComponent, UUID)

        // Run and Check the result
        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        const isStored = Boolean([...intersections].find((intersection) => intersection.entity === testEntity))
        assert.equal(isStored, false)
      })

      it('... should not find any intersections when selfAvatarEntity entity is undefined', () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent)
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()

        const testEntity = createEntity()
        setComponent(testEntity, VisibleComponent)
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, InputComponent)
        // Do not make the testEntity an Avatar entity, so that it is undefined
        // getMutableState(EngineState).userID.set("testUserID" as UserID)
        // const UUID = Engine.instance.userID + '_avatar' as EntityUUID
        // setComponent(testEntity, UUIDComponent, UUID)
        const selfAvatarEntity = UUIDComponent.getEntityByUUID((Engine.instance.userID + '_avatar') as EntityUUID)
        assert.equal(selfAvatarEntity, UndefinedEntity)

        // Run and Check the result
        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        assert.equal(intersections.size, 0)
      })
    })

    describe('when XRControlsState.isCameraAttachedToAvatar is falsy and `@param isSpatialInput` is truthy ...', () => {
      const isCameraAttachedToAvatar = false
      const isSpatialInput = true
      const avatarCameraMode = isCameraAttachedToAvatar ? 'attached' : 'auto'

      it('... should not store the avatarEntity into the `@param intersectionData`', () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent)
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()

        const testEntity = createEntity()
        setComponent(testEntity, VisibleComponent)
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, InputComponent)
        // Make the entity the selfAvatarEntity
        getMutableState(EngineState).userID.set('testUserID' as UserID)
        const UUID = (Engine.instance.userID + '_avatar') as EntityUUID
        setComponent(testEntity, UUIDComponent, UUID)

        // Run and Check the result
        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        const isStored = Boolean([...intersections].find((intersection) => intersection.entity === testEntity))
        assert.equal(isStored, false)
      })

      it("... should not store the User's avatar entity into the `@param intersectionData` set, even when there is an inputSourceEntity that is within the proximity threshold", () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent)
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()

        const testEntity = createEntity()
        getMutableState(EngineState).userID.set('testUserID' as UserID)
        const UUID = (Engine.instance.userID + '_avatar') as EntityUUID
        setComponent(testEntity, UUIDComponent, UUID)
        setComponent(testEntity, VisibleComponent)
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, InputComponent)
        // Run and Check the result
        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        const isStored = Boolean([...intersections].find((intersection) => intersection.entity === testEntity))
        assert.equal(isStored, false)
      })

      it('... should not find any intersections when selfAvatarEntity entity is undefined', () => {
        if (isCameraAttachedToAvatar) {
          getMutableState(XRState).merge({ avatarCameraMode, session: {} as XRSession })
          assert.equal(XRState.isCameraAttachedToAvatar, isCameraAttachedToAvatar)
        }

        const sourceEntity = createEntity()
        setComponent(sourceEntity, TransformComponent)
        const sorted = [] as IntersectionData[]
        const intersections = new Set<IntersectionData>()

        const testEntity = createEntity()
        setComponent(testEntity, VisibleComponent)
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, InputComponent)
        // Do not make the testEntity an Avatar entity, so that it is undefined
        // getMutableState(EngineState).userID.set("testUserID" as UserID)
        // const UUID = Engine.instance.userID + '_avatar' as EntityUUID
        // setComponent(testEntity, UUIDComponent, UUID)
        const selfAvatarEntity = UUIDComponent.getEntityByUUID((Engine.instance.userID + '_avatar') as EntityUUID)
        assert.equal(selfAvatarEntity, UndefinedEntity)

        // Run and Check the result
        findProximity(isSpatialInput, sourceEntity, sorted, intersections)
        assert.equal(intersections.size, 0)
      })
    })
  })
})
