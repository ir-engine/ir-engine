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

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { SystemDefinitions, SystemUUID, createEngine, destroyEngine, entityExists, getComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { MockXRMesh, MockXRPlane, MockXRSpace } from '../../tests/util/MockXR'
import { TransformComponent } from '../SpatialModule'
import { XRDetectedMeshComponent, XRDetectedMeshComponentState } from './XRDetectedMeshComponent'
import { XRDetectedMeshSystem } from './XRDetectedMeshSystem'
import { XRDetectedPlaneComponent, XRDetectedPlaneComponentState } from './XRDetectedPlaneComponent'
import { XRSystem } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRDetectedMeshSystem', () => {
  const System = SystemDefinitions.get(XRDetectedMeshSystem)!

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.XRDetectedMeshSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRDetectedMeshSystem).toBe('ee.engine.XRDetectedMeshSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(XRSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute', () => {}) //:: execute
  describe('reactor', () => {}) //:: reactor
}) //:: XRDetectedMeshSystem

describe('XRDetectedMeshSystem Functions', () => {
  describe('handleDetectedPlanes', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    describe('when XRDetectedPlaneComponent.updateDetectedPlanes is called', () => {
      it('should purge exisitng planes that are not in the new detectedPlanes list', () => {
        const state = getState(XRDetectedPlaneComponentState)
        const plane = new MockXRPlane()
        const purgeExpiredPlanes = vi.spyOn(XRDetectedPlaneComponent, 'purgeExpiredPlanes')

        expect(state.detectedPlanesMap.has(plane)).toBe(false)

        const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
        expect(entityExists(planeEntity)).toBe(true)
        expect(state.detectedPlanesMap.has(plane)).toBe(true)

        const emptySet = new Set<XRPlane>()
        XRDetectedPlaneComponent.updateDetectedPlanes(emptySet)
        expect(purgeExpiredPlanes).toHaveBeenCalledTimes(1)
        expect(entityExists(planeEntity)).toBe(false)
        expect(state.detectedPlanesMap.has(plane)).toBe(false)
        expect(state.planesLastChangedTimes.has(plane)).toBe(false)
      })

      it('.. should not do anything if detectedPlanes contains the plane entry', () => {
        const state = getState(XRDetectedPlaneComponentState)
        const plane = new MockXRPlane()
        expect(state.detectedPlanesMap.has(plane)).toBe(false)

        const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
        expect(entityExists(planeEntity)).toBe(true)
        expect(state.detectedPlanesMap.has(plane)).toBe(true)

        const detectedPlanes = new Set<XRPlane>([plane])
        XRDetectedPlaneComponent.updateDetectedPlanes(detectedPlanes)
        expect(state.planesLastChangedTimes.has(plane)).toBe(true)
        expect(state.detectedPlanesMap.has(plane)).toBe(true)
        expect(entityExists(planeEntity)).toBe(true)
      })
    })

    it(`should call XRDetectedPlaneComponent.getPlaneEntity with the plane`, () => {
      // Set the data as expected
      const state = getState(XRDetectedPlaneComponentState)
      const plane = new MockXRPlane()
      plane.lastChangedTime = 42
      const detectedPlanes = new Set<XRPlane>([plane])
      const getPlaneEntity = vi.spyOn(XRDetectedPlaneComponent, 'getPlaneEntity')
      // Sanity check before running
      expect(detectedPlanes.has(plane)).toBe(true)
      expect(state.detectedPlanesMap.has(plane)).toBe(false)
      expect(getPlaneEntity).not.toHaveBeenCalled()
      // Run and Check the result
      XRDetectedPlaneComponent.updateDetectedPlanes(detectedPlanes)
      expect(getPlaneEntity).toHaveBeenCalled()
    })

    it(`should call XRDetectedPlaneComponent.createGeometryFromPolygon
        with the plane and the entity that is tied to it
        if plane.lastChangedTime is bigger than the time found on the XRDetectedPlaneComponent.planesLastChangedTimes for that plane`, () => {
      const state = getState(XRDetectedPlaneComponentState)
      const plane = new MockXRPlane()
      plane.lastChangedTime = 42
      const detectedPlanes = new Set<XRPlane>([plane])
      const createGeometryFromPolygon = vi.spyOn(XRDetectedPlaneComponent, 'createGeometryFromPolygon')
      // Sanity check before running
      expect(detectedPlanes.has(plane)).toBe(true)
      expect(state.detectedPlanesMap.has(plane)).toBe(false)
      expect(createGeometryFromPolygon).not.toHaveBeenCalled()
      // Run and Check the result
      XRDetectedPlaneComponent.updateDetectedPlanes(detectedPlanes)
      expect(state.detectedPlanesMap.has(plane)).toBe(true)
      expect(createGeometryFromPolygon).toBeCalledTimes(1)
      expect(createGeometryFromPolygon).toHaveBeenCalledWith(plane)
      // Run again with the same plane data
      XRDetectedPlaneComponent.updateDetectedPlanes(detectedPlanes)
      expect(createGeometryFromPolygon).toBeCalledTimes(1)
      // Change the plane time
      plane.lastChangedTime = 43
      XRDetectedPlaneComponent.updateDetectedPlanes(detectedPlanes)
      expect(createGeometryFromPolygon).toBeCalledTimes(2)
    })

    it('should call XRDetectedPlaneComponent.updatePlanePose with the plane and the entity that is tied to it', () => {
      const state = getState(XRDetectedPlaneComponentState)
      const plane = new MockXRPlane()
      const position = new Vector3(1, 2, 3)
      const quaternion = new Quaternion(1, 2, 3, 4).normalize()
      const pose = new Matrix4().compose(position, quaternion, new Vector3(1, 1, 1))
      plane.planeSpace = new MockXRSpace(pose)
      plane.lastChangedTime = 42
      const updatePlanePose = vi.spyOn(XRDetectedPlaneComponent, 'updatePlanePose')
      // Sanity check before running
      expect(state.detectedPlanesMap.has(plane)).toBe(false)
      expect(updatePlanePose).not.toHaveBeenCalled()
      // Run and Check the result
      const detectedPlanes = new Set<XRPlane>([plane])
      XRDetectedPlaneComponent.updateDetectedPlanes(detectedPlanes)
      expect(state.detectedPlanesMap.has(plane)).toBe(true)
      const planeEntity = state.detectedPlanesMap.get(plane)!
      expect(updatePlanePose).toBeCalledTimes(1)
      expect(updatePlanePose).toHaveBeenCalledWith(planeEntity)
      const transform = getComponent(planeEntity, TransformComponent)
      expect(transform.position.x).to.be.approximately(position.x, 0.001)
      expect(transform.position.y).to.be.approximately(position.y, 0.001)
      expect(transform.position.z).to.be.approximately(position.z, 0.001)
      expect(transform.rotation.x).to.be.approximately(quaternion.x, 0.001)
      expect(transform.rotation.y).to.be.approximately(quaternion.y, 0.001)
      expect(transform.rotation.z).to.be.approximately(quaternion.z, 0.001)
      expect(transform.rotation.w).to.be.approximately(quaternion.w, 0.001)
    })

    it('should not do anything if detectedPlanes is empty', () => {
      const state = getState(XRDetectedPlaneComponentState)
      const emptySet = new Set<XRPlane>()
      XRDetectedPlaneComponent.updateDetectedPlanes(emptySet)
      expect(state.detectedPlanesMap.size).toBe(0)
    })
  }) //:: handleDetectedPlanes

  describe('handleDetectedMeshes', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    describe('when XRDetectedMeshComponent.updateDetectedMeshes is called', () => {
      it('should purge exisitng meshes if it is not in the new detectedMeshes list', () => {
        const mesh = new MockXRMesh()
        const state = getState(XRDetectedMeshComponentState)
        expect(state.detectedMeshesMap.has(mesh)).toBe(false)
        const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
        expect(entityExists(meshEntity)).toBe(true)
        expect(state.detectedMeshesMap.has(mesh)).toBe(true)
        const emptySet = new Set<XRMesh>()
        XRDetectedMeshComponent.updateDetectedMeshes(emptySet)
        expect(entityExists(meshEntity)).toBe(false)
        expect(state.detectedMeshesMap.has(mesh)).toBe(false)
        expect(state.meshesLastChangedTimes.has(mesh)).toBe(false)
      })

      it('should not purge an existing mesh if detectedMeshes contains the mesh', () => {
        const mesh = new MockXRMesh()
        const state = getState(XRDetectedMeshComponentState)
        expect(state.detectedMeshesMap.has(mesh)).toBe(false)
        const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
        expect(entityExists(meshEntity)).toBe(true)
        expect(state.detectedMeshesMap.has(mesh)).toBe(true)
        const detectedMeshes = new Set<XRMesh>([mesh])
        XRDetectedMeshComponent.updateDetectedMeshes(detectedMeshes)
        expect(state.meshesLastChangedTimes.has(mesh)).toBe(true)
      })
    })

    it("should call XRDetectedMeshComponent.getMeshEntity with the entry's mesh if XRDetectedMeshComponent.detectedMeshesMap list doesn't contain the mesh", () => {
      // Set the data as expected
      const mesh = new MockXRMesh()
      const getMeshEntity = vi.spyOn(XRDetectedMeshComponent, 'getMeshEntity')
      // Sanity check before running
      expect(getMeshEntity).not.toHaveBeenCalled()
      // Run and Check the result
      const detectedMeshes = new Set<XRMesh>([mesh])
      XRDetectedMeshComponent.updateDetectedMeshes(detectedMeshes)
      expect(getMeshEntity).toHaveBeenCalled()
      expect(getMeshEntity).toHaveBeenCalledWith(mesh)
    })

    it(`should call XRDetectedMeshComponent.updateMeshGeometry
        with the mesh and the entity that is tied to it
        if mesh.lastChangedTime is bigger than the time found on the XRDetectedMeshComponent.meshesLastChangedTimes for that mesh`, () => {
      // Set the data as expected
      const state = getState(XRDetectedMeshComponentState)
      const mesh = new MockXRMesh()
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      const detectedMeshes = new Set<XRMesh>([mesh])
      const createGeometryFromMesh = vi.spyOn(XRDetectedMeshComponent, 'createGeometryFromMesh')
      // Sanity check before running
      expect(detectedMeshes.has(mesh)).toBe(true)
      expect(state.detectedMeshesMap.has(mesh)).toBe(true)
      expect(createGeometryFromMesh).not.toHaveBeenCalled()
      // Run and Check the result
      XRDetectedMeshComponent.updateDetectedMeshes(detectedMeshes)
      expect(createGeometryFromMesh).toHaveBeenCalledTimes(1)
      expect(createGeometryFromMesh).toHaveBeenCalledWith(mesh)
      // Run again with the same mesh data
      XRDetectedMeshComponent.updateDetectedMeshes(detectedMeshes)
      expect(createGeometryFromMesh).toHaveBeenCalledTimes(1)
      // Change the mesh time
      mesh.lastChangedTime = 43
      XRDetectedMeshComponent.updateDetectedMeshes(detectedMeshes)
      expect(createGeometryFromMesh).toHaveBeenCalledTimes(2)
    })

    it('should call XRDetectedMeshComponent.updateMeshPose with the mesh and the entity that is tied to it', () => {
      // Set the data as expected
      const state = getState(XRDetectedMeshComponentState)
      const mesh = new MockXRMesh()
      const position = new Vector3(1, 2, 3)
      const quaternion = new Quaternion(1, 2, 3, 4).normalize()
      const pose = new Matrix4().compose(position, quaternion, new Vector3(1, 1, 1))
      mesh.meshSpace = new MockXRSpace(pose)
      const meshEntity = XRDetectedMeshComponent.getMeshEntity(mesh)
      const detectedMeshes = new Set<XRMesh>([mesh])
      const updateMeshPose = vi.spyOn(XRDetectedMeshComponent, 'updateMeshPose')
      // Sanity check before running
      expect(detectedMeshes.has(mesh)).toBe(true)
      expect(state.detectedMeshesMap.has(mesh)).toBe(true)
      expect(updateMeshPose).not.toHaveBeenCalled()
      // Run and Check the result
      XRDetectedMeshComponent.updateDetectedMeshes(detectedMeshes)
      expect(updateMeshPose).toHaveBeenCalledTimes(1)
      expect(updateMeshPose).toHaveBeenCalledWith(meshEntity)
      const transform = getComponent(meshEntity, TransformComponent)
      expect(transform.position.x).to.be.approximately(position.x, 0.001)
      expect(transform.position.y).to.be.approximately(position.y, 0.001)
      expect(transform.position.z).to.be.approximately(position.z, 0.001)
      expect(transform.rotation.x).to.be.approximately(quaternion.x, 0.001)
      expect(transform.rotation.y).to.be.approximately(quaternion.y, 0.001)
      expect(transform.rotation.z).to.be.approximately(quaternion.z, 0.001)
      expect(transform.rotation.w).to.be.approximately(quaternion.w, 0.001)
    })

    it('should not do anything if detectedMeshes is falsy', () => {
      const state = getState(XRDetectedMeshComponentState)
      const emptySet = new Set<XRMesh>()
      XRDetectedMeshComponent.updateDetectedMeshes(emptySet)
      expect(state.detectedMeshesMap.size).toBe(0)
    })
  }) //:: handleDetectedMeshes
}) //:: XRDetectedMeshSystem Functions
