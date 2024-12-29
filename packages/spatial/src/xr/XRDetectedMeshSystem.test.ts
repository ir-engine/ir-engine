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

import {
  SystemDefinitions,
  SystemUUID,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  entityExists,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { XRDetectedMeshComponent } from './XRDetectedMeshComponent'
import { XRDetectedMeshSystem, XRDetectedMeshSystemFunctions } from './XRDetectedMeshSystem'
import { XRDetectedPlaneComponent } from './XRDetectedPlaneComponent'
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
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEmulatedXREngine()
      destroyEngine()
    })

    describe('for every entry in the XRDetectedPlaneComponent.detectedPlanesMap list', () => {
      describe('when detectedPlanes does not contain the plane entry ..', () => {
        it('.. should call removeEntity for the entity of the entry', () => {
          const Expected = false
          // Set the data as expected
          const plane = { lastChangedTime: 42 } as XRPlane
          XRDetectedPlaneComponent.detectedPlanesMap.set(plane, testEntity)
          const detectedPlanes = new Set<XRPlane>()
          const frame = { detectedPlanes: detectedPlanes } as XRFrame
          // Sanity check before running
          expect(detectedPlanes).not.toContain(plane)
          expect(Array.from(XRDetectedPlaneComponent.detectedPlanesMap.keys())).toContain(plane)
          const before = entityExists(testEntity)
          expect(before).not.toBe(Expected)
          // Run and Check the result
          XRDetectedMeshSystemFunctions.handleDetectedPlanes(frame)
          const result = entityExists(testEntity)
          expect(result).toBe(Expected)
        })

        it(".. should delete the entry's plane from the XRDetectedPlaneComponent.detectedPlanesMap list", () => {
          const Expected = false
          const Initial = !Expected
          // Set the data as expected
          const plane = { lastChangedTime: 42 } as XRPlane
          XRDetectedPlaneComponent.detectedPlanesMap.set(plane, testEntity)
          const detectedPlanes = new Set<XRPlane>()
          const frame = { detectedPlanes: detectedPlanes } as XRFrame
          // Sanity check before running
          expect(detectedPlanes).not.toContain(plane)
          const before = Array.from(XRDetectedPlaneComponent.detectedPlanesMap.keys()).includes(plane)
          expect(before).toBe(Initial)
          expect(before).not.toBe(Expected)
          // Run and Check the result
          XRDetectedMeshSystemFunctions.handleDetectedPlanes(frame)
          const result = Array.from(XRDetectedPlaneComponent.detectedPlanesMap.keys()).includes(plane)
          expect(result).not.toBe(Initial)
          expect(result).toBe(Expected)
        })

        it(".. should delete the entry's plane from the XRDetectedPlaneComponent.planesLastChangedTimes list", () => {
          const Expected = false
          const Initial = !Expected
          // Set the data as expected
          const plane = { lastChangedTime: 42 } as XRPlane
          XRDetectedPlaneComponent.detectedPlanesMap.set(plane, testEntity)
          XRDetectedPlaneComponent.planesLastChangedTimes.set(plane, testEntity)
          const detectedPlanes = new Set<XRPlane>()
          const frame = { detectedPlanes: detectedPlanes } as XRFrame
          // Sanity check before running
          expect(detectedPlanes).not.toContain(plane)
          const before = Array.from(XRDetectedPlaneComponent.planesLastChangedTimes.keys()).includes(plane)
          expect(before).toBe(Initial)
          expect(before).not.toBe(Expected)
          // Run and Check the result
          XRDetectedMeshSystemFunctions.handleDetectedPlanes(frame)
          const result = Array.from(XRDetectedPlaneComponent.planesLastChangedTimes.keys()).includes(plane)
          expect(result).not.toBe(Initial)
          expect(result).toBe(Expected)
        })
      })

      it('.. should not do anything if detectedPlanes contains the plane entry', () => {
        const Initial = true
        // Set the data as expected
        const plane = { lastChangedTime: 42 } as XRPlane
        XRDetectedPlaneComponent.detectedPlanesMap.set(plane, testEntity)
        const detectedPlanes = new Set<XRPlane>([plane])
        const frame = { detectedPlanes: detectedPlanes } as XRFrame
        // Sanity check before running
        expect(detectedPlanes).toContain(plane)
        expect(Array.from(XRDetectedPlaneComponent.detectedPlanesMap.keys())).toContain(plane)
        const before = entityExists(testEntity)
        expect(before).toBe(Initial)
        // Run and Check the result
        XRDetectedMeshSystemFunctions.handleDetectedPlanes(frame)
        const result = entityExists(testEntity)
        expect(result).toBe(Initial)
      })
    })

    describe('for every plane in the detectedPlanes list', () => {
      it(`.. should call XRDetectedPlaneComponent.foundPlane with the plane
          if the XRDetectedPlaneComponent.detectedPlanesMap list doesn't contain the plane`, () => {
        // Set the data as expected
        const plane = { lastChangedTime: 42 } as XRPlane
        const detectedPlanes = new Set<XRPlane>([plane])
        const frame = { detectedPlanes: detectedPlanes } as XRFrame
        const result = vi.spyOn(XRDetectedPlaneComponent, 'foundPlane')
        // Sanity check before running
        expect(frame.detectedPlanes).toContain(plane)
        expect(Array.from(XRDetectedPlaneComponent.detectedPlanesMap.keys())).not.toContain(plane)
        expect(result).not.toHaveBeenCalled()
        // Run and Check the result
        XRDetectedMeshSystemFunctions.handleDetectedPlanes(frame)
        expect(result).toHaveBeenCalled()
      })

      it(`.. should call XRDetectedPlaneComponent.updatePlaneGeometry
          with the plane and the entity that is tied to it
          if plane.lastChangedTime is bigger than the time found on the XRDetectedPlaneComponent.planesLastChangedTimes for that plane`, () => {
        // Set the data as expected
        const lastChangedTime = 42
        const lastKnownTime = lastChangedTime - 1
        const point = { x: 40, y: 41, z: 42 } as DOMPointReadOnly
        const plane = { lastChangedTime: lastChangedTime, polygon: [point] } as XRPlane
        XRDetectedPlaneComponent.detectedPlanesMap.set(plane, testEntity)
        XRDetectedPlaneComponent.planesLastChangedTimes.set(plane, lastKnownTime)
        const detectedPlanes = new Set<XRPlane>([plane])
        const frame = { detectedPlanes: detectedPlanes } as XRFrame
        setComponent(testEntity, XRDetectedPlaneComponent, { plane: plane })
        const result = vi.spyOn(XRDetectedPlaneComponent, 'updatePlaneGeometry')
        // Sanity check before running
        expect(plane.lastChangedTime).toBeGreaterThan(XRDetectedPlaneComponent.planesLastChangedTimes.get(plane)!)
        expect(frame.detectedPlanes).toContain(plane)
        expect(Array.from(XRDetectedPlaneComponent.detectedPlanesMap.keys())).toContain(plane)
        expect(hasComponent(testEntity, XRDetectedPlaneComponent)).toBe(true)
        expect(result).not.toHaveBeenCalled()
        // Run and Check the result
        XRDetectedMeshSystemFunctions.handleDetectedPlanes(frame)
        expect(result).toHaveBeenCalled()
        expect(result).toHaveBeenCalledWith(testEntity, plane)
      })

      it('.. should call XRDetectedPlaneComponent.updatePlanePose with the plane and the entity that is tied to it', () => {
        // Set the data as expected
        const point = { x: 40, y: 41, z: 42 } as DOMPointReadOnly
        const plane = { polygon: [point] } as XRPlane
        XRDetectedPlaneComponent.detectedPlanesMap.set(plane, testEntity)
        const detectedPlanes = new Set<XRPlane>([plane])
        const frame = { detectedPlanes: detectedPlanes } as XRFrame
        const result = vi.spyOn(XRDetectedPlaneComponent, 'updatePlanePose')
        // Sanity check before running
        expect(frame.detectedPlanes).toContain(plane)
        expect(Array.from(XRDetectedPlaneComponent.detectedPlanesMap.keys())).toContain(plane)
        expect(result).not.toHaveBeenCalled()
        // Run and Check the result
        XRDetectedMeshSystemFunctions.handleDetectedPlanes(frame)
        expect(result).toHaveBeenCalled()
        expect(result).toHaveBeenCalledWith(testEntity, plane)
      })
    })

    it('should not do anything if frame.worldInformation?.detectedPlanes and frame.detectedPlanes are both falsy', () => {
      const Initial = true
      // Sanity check before running
      const frame = { detectedPlanes: undefined, worldInformation: { detectedPlanes: undefined } } as XRFrame
      expect(frame.worldInformation?.detectedPlanes).toBeFalsy()
      expect(frame.detectedPlanes).toBeFalsy()
      const before = entityExists(testEntity)
      expect(before).toBe(Initial)
      // Run and Check the result
      XRDetectedMeshSystemFunctions.handleDetectedPlanes(frame)
      const result = entityExists(testEntity)
      expect(result).toBe(Initial)
    })
  }) //:: handleDetectedPlanes

  describe('handleDetectedMeshes', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEmulatedXREngine()
      destroyEngine()
    })

    describe('for every entry in the XRDetectedMeshComponent.detectedMeshesMap list', () => {
      it('.. should call removeEntity for the entity of the entry', () => {
        const Expected = false
        // Set the data as expected
        const mesh = {} as XRMesh
        XRDetectedMeshComponent.detectedMeshesMap.set(mesh, testEntity)
        const detectedMeshes = new Set<XRMesh>()
        const frame = { detectedMeshes: detectedMeshes } as XRFrame
        // Sanity check before running
        expect(frame.detectedMeshes).toBeTruthy()
        expect(detectedMeshes).not.toContain(mesh)
        expect(Array.from(XRDetectedMeshComponent.detectedMeshesMap.keys())).toContain(mesh)
        const before = entityExists(testEntity)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        XRDetectedMeshSystemFunctions.handleDetectedMeshes(frame)
        const result = entityExists(testEntity)
        expect(result).toBe(Expected)
      })

      it(".. should delete the entry's mesh from the XRDetectedPlaneComponent.detectedMeshesMap list", () => {
        const Expected = false
        const Initial = !Expected
        // Set the data as expected
        const mesh = {} as XRMesh
        XRDetectedMeshComponent.detectedMeshesMap.set(mesh, testEntity)
        const detectedMeshes = new Set<XRMesh>()
        const frame = { detectedMeshes: detectedMeshes } as XRFrame
        // Sanity check before running
        expect(frame.detectedMeshes).toBeTruthy()
        expect(detectedMeshes).not.toContain(mesh)
        const before = Array.from(XRDetectedMeshComponent.detectedMeshesMap.keys()).includes(mesh)
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        XRDetectedMeshSystemFunctions.handleDetectedMeshes(frame)
        const result = Array.from(XRDetectedMeshComponent.detectedMeshesMap.keys()).includes(mesh)
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it(".. should delete the entry's mesh from the XRDetectedPlaneComponent.meshesLastChangedTimes list", () => {
        const Expected = false
        const Initial = !Expected
        // Set the data as expected
        const mesh = { lastChangedTime: 42 } as XRMesh
        XRDetectedMeshComponent.detectedMeshesMap.set(mesh, testEntity)
        XRDetectedMeshComponent.meshesLastChangedTimes.set(mesh, testEntity)
        const detectedMeshes = new Set<XRMesh>()
        const frame = { detectedMeshes: detectedMeshes } as XRFrame
        // Sanity check before running
        expect(frame.detectedMeshes).toBeTruthy()
        expect(detectedMeshes).not.toContain(mesh)
        const before = Array.from(XRDetectedMeshComponent.meshesLastChangedTimes.keys()).includes(mesh)
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        XRDetectedMeshSystemFunctions.handleDetectedMeshes(frame)
        const result = Array.from(XRDetectedMeshComponent.meshesLastChangedTimes.keys()).includes(mesh)
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it('.. should not do anything if frame.detectedMeshes contains the mesh', () => {
        const Initial = true
        // Set the data as expected
        const mesh = {} as XRMesh
        XRDetectedMeshComponent.detectedMeshesMap.set(mesh, testEntity)
        const detectedMeshes = new Set<XRMesh>([mesh])
        const frame = { detectedMeshes: detectedMeshes } as XRFrame
        // Sanity check before running
        expect(frame.detectedMeshes).toBeTruthy()
        expect(detectedMeshes).toContain(mesh)
        expect(Array.from(XRDetectedMeshComponent.detectedMeshesMap.keys())).toContain(mesh)
        const before = entityExists(testEntity)
        expect(before).toBe(Initial)
        // Run and Check the result
        XRDetectedMeshSystemFunctions.handleDetectedMeshes(frame)
        const result = entityExists(testEntity)
        expect(result).toBe(Initial)
      })
    })

    describe('for every entry in the XRDetectedMeshComponent.detectedMeshes list', () => {
      it(".. should call XRDetectedMeshComponent.foundMesh with the entry's mesh if XRDetectedMeshComponent.detectedMeshesMap list doesn't contain the mesh", () => {
        // Set the data as expected
        const mesh = { lastChangedTime: 42 } as XRMesh
        const detectedMeshes = new Set<XRMesh>([mesh])
        const frame = { detectedMeshes: detectedMeshes } as XRFrame
        const result = vi.spyOn(XRDetectedMeshComponent, 'foundMesh')
        // Sanity check before running
        expect(frame.detectedMeshes).toBeTruthy()
        expect(frame.detectedMeshes).toContain(mesh)
        expect(Array.from(XRDetectedMeshComponent.detectedMeshesMap.keys())).not.toContain(mesh)
        expect(result).not.toHaveBeenCalled()
        // Run and Check the result
        XRDetectedMeshSystemFunctions.handleDetectedMeshes(frame)
        expect(result).toHaveBeenCalled()
        expect(result).toHaveBeenCalledWith(mesh)
      })

      it(`.. should call XRDetectedMeshComponent.updateMeshGeometry
          with the mesh and the entity that is tied to it
          if mesh.lastChangedTime is bigger than the time found on the XRDetectedMeshComponent.meshesLastChangedTimes for that mesh`, () => {
        // Set the data as expected
        const lastChangedTime = 42
        const lastKnownTime = lastChangedTime - 1
        const mesh = { lastChangedTime: lastChangedTime } as XRMesh
        XRDetectedMeshComponent.detectedMeshesMap.set(mesh, testEntity)
        XRDetectedMeshComponent.meshesLastChangedTimes.set(mesh, lastKnownTime)
        const detectedMeshes = new Set<XRMesh>([mesh])
        const frame = { detectedMeshes: detectedMeshes } as XRFrame
        setComponent(testEntity, XRDetectedMeshComponent, { mesh: mesh })
        const result = vi.spyOn(XRDetectedMeshComponent, 'updateMeshGeometry')
        // Sanity check before running
        expect(frame.detectedMeshes).toBeTruthy()
        expect(mesh.lastChangedTime).toBeGreaterThan(XRDetectedMeshComponent.meshesLastChangedTimes.get(mesh)!)
        expect(frame.detectedMeshes).toContain(mesh)
        expect(Array.from(XRDetectedMeshComponent.detectedMeshesMap.keys())).toContain(mesh)
        expect(hasComponent(testEntity, XRDetectedMeshComponent)).toBe(true)
        expect(result).not.toHaveBeenCalled()
        // Run and Check the result
        XRDetectedMeshSystemFunctions.handleDetectedMeshes(frame)
        expect(result).toHaveBeenCalled()
        expect(result).toHaveBeenCalledWith(testEntity, mesh)
      })

      it('.. should call XRDetectedMeshComponent.updateMeshPose with the mesh and the entity that is tied to it', () => {
        // Set the data as expected
        const mesh = {} as XRMesh
        XRDetectedMeshComponent.detectedMeshesMap.set(mesh, testEntity)
        const detectedMeshes = new Set<XRMesh>([mesh])
        const frame = { detectedMeshes: detectedMeshes } as XRFrame
        const result = vi.spyOn(XRDetectedMeshComponent, 'updateMeshPose')
        // Sanity check before running
        expect(frame.detectedMeshes).toBeTruthy()
        expect(frame.detectedMeshes).toContain(mesh)
        expect(Array.from(XRDetectedMeshComponent.detectedMeshesMap.keys())).toContain(mesh)
        expect(result).not.toHaveBeenCalled()
        // Run and Check the result
        XRDetectedMeshSystemFunctions.handleDetectedMeshes(frame)
        expect(result).toHaveBeenCalled()
        expect(result).toHaveBeenCalledWith(testEntity, mesh)
      })
    })

    it('should not do anything if `@param frame`.detectedMeshes is falsy', () => {
      const Initial = true
      // Set the data as expected
      const mesh = {} as XRMesh
      XRDetectedMeshComponent.detectedMeshesMap.set(mesh, testEntity)
      const detectedMeshes = new Set<XRMesh>()
      // @ts-expect-error Allow declaring the detectedMeshes field as undefined
      const frame = { detectedMeshes: undefined } as XRFrame
      // Sanity check before running
      expect(frame.detectedMeshes).toBeFalsy()
      expect(detectedMeshes).not.toContain(mesh)
      expect(Array.from(XRDetectedMeshComponent.detectedMeshesMap.keys())).toContain(mesh)
      const before = entityExists(testEntity)
      expect(before).toBe(Initial)
      // Run and Check the result
      XRDetectedMeshSystemFunctions.handleDetectedMeshes(frame)
      const result = entityExists(testEntity)
      expect(result).toBe(Initial)
    })
  }) //:: handleDetectedMeshes
}) //:: XRDetectedMeshSystem Functions
