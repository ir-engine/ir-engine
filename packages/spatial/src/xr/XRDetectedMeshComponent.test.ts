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
import { afterEach, assert, beforeEach, describe, expect, it } from 'vitest'
import { MockXRFrame, MockXRMesh, MockXRSpace } from '../../tests/util/MockXR'
import { assertVec } from '../../tests/util/assert'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { mockSpatialEngine } from '../../tests/util/mockSpatialEngine'
import { requestEmulatedXRSession } from '../../tests/webxr/emulator'

import {
  EntityTreeComponent,
  UndefinedEntity,
  createEngine,
  destroyEngine,
  getComponent,
  hasComponent
} from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { TransformComponent } from '../SpatialModule'
import { NameComponent } from '../common/NameComponent'
import { VisibleComponent } from '../renderer/components/VisibleComponent'
import { XRDetectedMeshComponent, XRDetectedMeshComponentState } from './XRDetectedMeshComponent'
import { ReferenceSpace, XRState } from './XRState'

describe('XRDetectedMeshComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRDetectedMeshComponent.name).toBe('XRDetectedMeshComponent')
    })
  }) //:: Fields

  describe('createGeometryFromMesh', () => {
    it('should create a BufferGeometry object and return it', () => {
      // Run and Check the result
      const result = XRDetectedMeshComponent.createGeometryFromMesh({} as XRMesh)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(null)
      expect(result.isBufferGeometry).not.toBe(undefined)
      expect(result.isBufferGeometry).toBe(true)
    })

    it("should call setAttribute('position') with a new BufferAttribute made from the `@param mesh` vertices property", () => {
      const Expected = new Float32Array([40, 41, 42, 43, 44, 45, 46, 47, 48])
      // Set the data as expected
      const mesh = { vertices: Expected } as XRMesh
      // Run and Check the result
      const result = XRDetectedMeshComponent.createGeometryFromMesh(mesh)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(null)
      expect(result.hasAttribute('position'))
      expect(result.getAttribute('position').array).toEqual(Expected)
    })

    it('should call setIndex() with a new BufferAttribute made from the `@param mesh` indices property', () => {
      const Expected = new Uint32Array([40, 41, 42, 43, 44, 45, 46, 47, 48])
      const Vertices = new Float32Array([40, 41, 42, 43, 44, 45, 46, 47, 48])
      // Set the data as expected
      const mesh = { vertices: Vertices, indices: Expected } as XRMesh
      // Run and Check the result
      const result = XRDetectedMeshComponent.createGeometryFromMesh(mesh)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(null)
      expect(result.getIndex()).not.toBe(null)
      expect(result.getIndex()?.array).toEqual(Expected)
    })

    it('should call computeBoundingBox on the resulting object', () => {
      // Set the data as expected
      const mesh = {} as XRMesh
      // Run and Check the result
      const result = XRDetectedMeshComponent.createGeometryFromMesh(mesh)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(null)
      expect(result.boundingBox).not.toBe(null)
    })

    it('should call computeBoundingSphere on the resulting object', () => {
      // Set the data as expected
      const mesh = {} as XRMesh
      // Run and Check the result
      const result = XRDetectedMeshComponent.createGeometryFromMesh(mesh)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(null)
      expect(result.boundingSphere).not.toBe(null)
    })
  }) //:: createGeometryFromMesh

  describe('updateMeshGeometry', () => {
    beforeEach(async () => {
      createEngine()
      mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should set XRDetectedMeshComponentState.meshesLastChangedTimes for the mesh to the value of `@param mesh`.lastChangedTime', () => {
      const Expected = 42
      // Set the data as expected
      const state = getState(XRDetectedMeshComponentState)
      const mesh = { lastChangedTime: Expected } as XRMesh
      const before = state.meshesLastChangedTimes.get(mesh)
      expect(before).toBe(undefined)

      const entity = XRDetectedMeshComponent.getMeshEntity(mesh)
      const after = state.meshesLastChangedTimes.get(mesh)
      expect(after).toBe(-1)

      XRDetectedMeshComponent.updateMeshGeometry(entity)
      const result = state.meshesLastChangedTimes.get(mesh)
      expect(result).toBe(Expected)
    })
  }) //:: updateMeshGeometry

  describe('updateMeshPose', () => {
    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      await requestEmulatedXRSession()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should update the TransformComponent.position of the `@param entity` with the value of PlanePose.transform.position', () => {
      const mesh = new MockXRMesh()
      const position = new Vector3(1, 2, 3)
      const quaternion = new Quaternion(1, 2, 3, 4).normalize()
      const pose = new Matrix4().compose(position, quaternion, new Vector3(1, 1, 1))
      mesh.meshSpace = new MockXRSpace(pose)
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      XRDetectedMeshComponent.updateMeshPose(meshEntity)
      const transform = getComponent(meshEntity, TransformComponent)
      assertVec.approxEq(transform.position, position, 3, 0.001)
    })

    it('should update the TransformComponent.rotation of the `@param entity` with the value of PlanePose.transform.rotation', () => {
      const mesh = new MockXRMesh()
      const position = new Vector3(1, 2, 3)
      const quaternion = new Quaternion(1, 2, 3, 4).normalize()
      const pose = new Matrix4().compose(position, quaternion, new Vector3(1, 1, 1))
      mesh.meshSpace = new MockXRSpace(pose)
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      XRDetectedMeshComponent.updateMeshPose(meshEntity)
      const transform = getComponent(meshEntity, TransformComponent)
      assertVec.approxEq(transform.rotation, quaternion, 4, 0.001)
    })

    it('should not do anything when XRState.xrFrame.getPose(`@param mesh`.meshSpace, ReferenceSpace.localFloor) is falsy', () => {
      // Set the data as expected
      // @ts-expect-error Allow coercing the MockXRFrame type into the xrFrame property
      const xrFrame = new MockXRFrame() as XRFrame
      xrFrame.getPose = () => undefined
      getMutableState(XRState).xrFrame.set(xrFrame)
      const mesh = new MockXRMesh()
      const position = new Vector3(1, 2, 3)
      const quaternion = new Quaternion(1, 2, 3, 4).normalize()
      const pose = new Matrix4().compose(position, quaternion, new Vector3(1, 1, 1))
      mesh.meshSpace = new MockXRSpace(pose)
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      // Sanity check before running
      const transform = getComponent(meshEntity, TransformComponent)
      expect(transform.position.x).toBe(0)
      expect(transform.position.y).toBe(0)
      expect(transform.position.z).toBe(0)
      expect(transform.rotation.x).toBe(0)
      expect(transform.rotation.y).toBe(0)
      expect(transform.rotation.z).toBe(0)
      expect(transform.rotation.w).toBe(1)

      // Run and Check the result
      const planePose = getState(XRState).xrFrame!.getPose(mesh.meshSpace, ReferenceSpace.localFloor!)!
      expect(planePose).toBeFalsy()
      XRDetectedMeshComponent.updateMeshPose(meshEntity)
      expect(transform.position.x).toBe(0)
      expect(transform.position.y).toBe(0)
      expect(transform.position.z).toBe(0)
      expect(transform.rotation.x).toBe(0)
      expect(transform.rotation.y).toBe(0)
      expect(transform.rotation.z).toBe(0)
      expect(transform.rotation.w).toBe(1)
    })
  }) //:: updateMeshPose

  describe('getMeshEntity', () => {
    beforeEach(async () => {
      createEngine()
      mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should set the XRDetectedMeshComponentState.detectedMeshesMap entry for the `@param mesh` to have the newly created entity', () => {
      // Set the data as expected
      const mesh = new MockXRMesh()
      const state = getState(XRDetectedMeshComponentState)
      const before = state.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      const result = state.detectedMeshesMap.get(mesh)
      expect(result).toBe(meshEntity)
    })

    it('should add an EntityTreeComponent to the new entity and set its parentEntity to ReferenceSpaceState.localFloorEntity', () => {
      // Set the data as expected
      const mesh = new MockXRMesh()
      const state = getState(XRDetectedMeshComponentState)
      const before = state.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      assert(meshEntity)
      expect(meshEntity).not.toBe(UndefinedEntity)
      expect(hasComponent(meshEntity, EntityTreeComponent)).toBe(true)
      expect(getComponent(meshEntity, EntityTreeComponent).parentEntity).toBe(
        getState(ReferenceSpaceState).localFloorEntity
      )
    })

    it('should add TransformComponent to the new entity', () => {
      // Set the data as expected
      const mesh = new MockXRMesh()
      const state = getState(XRDetectedMeshComponentState)
      const before = state.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      assert(meshEntity)
      expect(meshEntity).not.toBe(UndefinedEntity)
      expect(hasComponent(meshEntity, TransformComponent)).toBe(true)
    })

    it('should add a VisibleComponent to the new entity', () => {
      // Set the data as expected
      const mesh = new MockXRMesh()
      const state = getState(XRDetectedMeshComponentState)
      const before = state.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      assert(meshEntity)
      expect(meshEntity).not.toBe(UndefinedEntity)
      expect(hasComponent(meshEntity, VisibleComponent)).toBe(true)
    })

    it("should add a NameComponent to the new entity with a value of 'xrmesh-*", () => {
      // Set the data as expected
      const mesh = new MockXRMesh()
      const state = getState(XRDetectedMeshComponentState)
      const before = state.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      assert(meshEntity)
      expect(meshEntity).not.toBe(UndefinedEntity)
      expect(hasComponent(meshEntity, NameComponent)).toBe(true)
      expect(getComponent(meshEntity, NameComponent).startsWith('xrmesh-')).toBe(true)
    })

    it('should add a XRDetectedMeshComponent to the new entity with `@param mesh` as its XRDetectedMeshComponent.mesh property', () => {
      // Set the data as expected
      const mesh = new MockXRMesh()
      const state = getState(XRDetectedMeshComponentState)
      const before = state.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      assert(meshEntity)
      expect(meshEntity).not.toBe(UndefinedEntity)
      expect(hasComponent(meshEntity, XRDetectedMeshComponent)).toBe(true)
      expect(getComponent(meshEntity, XRDetectedMeshComponent).mesh).toBe(mesh)
    })

    it('should set XRDetectedMeshComponentState.meshesLastChangedTimes for the mesh to the value of `@param mesh`.lastChangedTime', () => {
      const state = getState(XRDetectedMeshComponentState)
      const mesh = new MockXRMesh()
      mesh.lastChangedTime = 42
      const before = state.meshesLastChangedTimes.get(mesh)
      expect(before).toBe(undefined)
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      const after = state.meshesLastChangedTimes.get(mesh)
      expect(after).toBe(-1)
      assert(meshEntity)
      expect(meshEntity).not.toBe(UndefinedEntity)
      expect(hasComponent(meshEntity, XRDetectedMeshComponent)).toBe(true)
      expect(getComponent(meshEntity, XRDetectedMeshComponent).mesh).toBe(mesh)
      XRDetectedMeshComponent.updateDetectedMeshes(new Set<XRMesh>([mesh]))
      const result = state.meshesLastChangedTimes.get(mesh)
      expect(result).toBe(42)
    })
  }) //:: foundMesh

  /** @todo */
  describe('reactor', () => {}) //:: reactor
}) //:: XRDetectedMeshComponent
