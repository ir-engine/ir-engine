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
import { MockXRFrame } from '../../tests/util/MockXR'
import { assertVec } from '../../tests/util/assert'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { mockSpatialEngine } from '../../tests/util/mockSpatialEngine'
import { requestEmulatedXRSession } from '../../tests/webxr/emulator'

import {
  EntityTreeComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { BufferGeometry, Color, Quaternion, Vector3 } from 'three'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { TransformComponent } from '../SpatialModule'
import { NameComponent } from '../common/NameComponent'
import { VisibleComponent } from '../renderer/components/VisibleComponent'
import { XRDetectedPlaneComponent, placementHelperMaterial, shadowMaterial } from './XRDetectedPlaneComponent'
import { ReferenceSpace, XRState } from './XRState'

describe('placementHelperMaterial', () => {
  it('should initialize Material.color with the expected value', () => {
    expect(placementHelperMaterial.color.getHex()).toBe(new Color('grey').getHex())
  })

  it('should initialize Material.wireframe with the expected value', () => {
    expect(placementHelperMaterial.wireframe).toBe(false)
  })

  it('should initialize Material.opacity with the expected value', () => {
    expect(placementHelperMaterial.opacity).toBe(0.5)
  })

  it('should initialize Material.transparent with the expected value', () => {
    expect(placementHelperMaterial.transparent).toBe(true)
  })
}) //:: placementHelperMaterial

describe('shadowMaterial', () => {
  it('should initialize Material.color with the expected value', () => {
    expect(shadowMaterial.color.getHex()).toBe(0x0a0a0a)
  })

  it('should initialize Material.opacity with the expected value', () => {
    expect(shadowMaterial.opacity).toBe(0.5)
  })

  it('should initialize Material.polygonOffset with the expected value', () => {
    expect(shadowMaterial.polygonOffset).toBe(true)
  })

  it('should initialize Material.polygonOffsetFactor with the expected value', () => {
    expect(shadowMaterial.polygonOffsetFactor).toBe(-0.01)
  })
}) //:: shadowMaterial

// describe('occlusionMat', () => {
//   it('should initialize Material.colorWrite with the expected value', () => {
//     expect(occlusionMat.colorWrite).toBe(false)
//   })

//   it('should initialize Material.polygonOffset with the expected value', () => {
//     expect(occlusionMat.polygonOffset).toBe(true)
//   })

//   it('should initialize Material.polygonOffsetFactor with the expected value', () => {
//     expect(occlusionMat.polygonOffsetFactor).toBe(-0.01)
//   })
// }) //:: occlusionMat

describe('XRDetectedPlaneComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRDetectedPlaneComponent.name).toBe('XRDetectedPlaneComponent')
    })
  }) //:: Fields

  describe('createGeometryFromPolygon', () => {
    it('should create a new BufferGeometry object and return it', () => {
      // Set the data as expected
      const plane = { polygon: [] as DOMPointReadOnly[] } as XRPlane
      // Run and Check the result
      const result = XRDetectedPlaneComponent.createGeometryFromPolygon(plane)
      assert(result)
      expect(result.isBufferGeometry).not.toBe(undefined)
      expect(result.isBufferGeometry).toBe(true)
    })

    it("should add a 'position' Attribute to the BufferGeometry", () => {
      // Set the data as expected
      const plane = { polygon: [] as DOMPointReadOnly[] } as XRPlane
      // Run and Check the result
      const result = XRDetectedPlaneComponent.createGeometryFromPolygon(plane)
      assert(result)
      expect(result.hasAttribute('position')).toBe(true)
    })

    it("should add a 'uv' Attribute to the BufferGeometry", () => {
      // Set the data as expected
      const plane = { polygon: [] as DOMPointReadOnly[] } as XRPlane
      // Run and Check the result
      const result = XRDetectedPlaneComponent.createGeometryFromPolygon(plane)
      assert(result)
      expect(result.hasAttribute('uv')).toBe(true)
    })

    it('should add indices to the BufferGeometry', () => {
      // Set the data as expected
      const plane = {
        polygon: [
          { x: 40, y: 41, z: 42 },
          { x: 43, y: 44, z: 45 },
          { x: 46, y: 47, z: 48 }
        ] as DOMPointReadOnly[]
      } as XRPlane
      // Run and Check the result
      const result = XRDetectedPlaneComponent.createGeometryFromPolygon(plane)
      assert(result)
      expect(result.getIndex()?.array.length).not.toBe(0)
    })

    it('should call computeBoundingBox on the resulting BufferGeometry', () => {
      // Set the data as expected
      const plane = { polygon: [] as DOMPointReadOnly[] } as XRPlane
      // Run and Check the result
      const result = XRDetectedPlaneComponent.createGeometryFromPolygon(plane)
      assert(result)
      expect(result.boundingBox).not.toBe(null)
    })

    it('should call computeBoundingSphere on the resulting BufferGeometry', () => {
      // Set the data as expected
      const plane = { polygon: [] as DOMPointReadOnly[] } as XRPlane
      // Run and Check the result
      const result = XRDetectedPlaneComponent.createGeometryFromPolygon(plane)
      assert(result)
      expect(result.boundingSphere).not.toBe(null)
    })
  }) //:: createGeometryFromPolygon

  describe('updatePlaneGeometry', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockEmulatedXREngine()
      testEntity = createEntity()
      setComponent(testEntity, XRDetectedPlaneComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should set XRDetectedPlaneComponent.planesLastChangedTimes for the plane to the value of `@param plane`.lastChangedTime', () => {
      const Expected = 42
      // Set the data as expected
      const plane = { lastChangedTime: Expected, polygon: [] as DOMPointReadOnly[] } as XRPlane
      const before = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedPlaneComponent.updatePlaneGeometry(testEntity, plane)
      const result = XRDetectedPlaneComponent.planesLastChangedTimes.get(plane)
      expect(result).toBe(Expected)
    })

    it('should call createGeometryFromPolygon and assign the newly created geometry to `@param entity`.XRDetectedPlaneComponent.geometry', () => {
      const Initial = new BufferGeometry()
      getMutableComponent(testEntity, XRDetectedPlaneComponent).geometry.set(Initial)
      // Set the data as expected
      const plane = { lastChangedTime: 42, polygon: [] as DOMPointReadOnly[] } as XRPlane
      const before = getComponent(testEntity, XRDetectedPlaneComponent).geometry
      expect(before).toBe(Initial)
      // Run and Check the result
      XRDetectedPlaneComponent.updatePlaneGeometry(testEntity, plane)
      const result = getComponent(testEntity, XRDetectedPlaneComponent).geometry
      expect(result).not.toBe(Initial)
    })
  }) //:: updatePlaneGeometry

  describe('updatePlanePose', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      await requestEmulatedXRSession()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should update the TransformComponent.position of the `@param entity` with the value of PlanePose.transform.position', () => {
      const Expected = new Vector3()
      const Initial = new Vector3(1, 2, 3)
      // Set the data as expected
      // @ts-expect-error Allow coercing the MockXRFrame type into the xrFrame property
      const xrFrame = new MockXRFrame() as XRFrame
      // xrFrame.getPose = () => undefined
      getMutableState(XRState).xrFrame.set(xrFrame)
      setComponent(testEntity, TransformComponent, { position: Initial })
      const plane = {} as XRPlane
      // Sanity check before running
      const before = getComponent(testEntity, TransformComponent).position.clone()
      assertVec.approxEq(before, Initial, 3)
      assertVec.anyApproxNotEq(before, Expected, 3)
      // Run and Check the result
      XRDetectedPlaneComponent.updatePlanePose(testEntity, plane)
      const result = getComponent(testEntity, TransformComponent).position.clone()
      assertVec.approxEq(result, Expected, 3)
    })

    it('should update the TransformComponent.rotation of the `@param entity` with the value of PlanePose.transform.rotation', () => {
      const Expected = new Quaternion(0, 0, 0, 0)
      const Initial = new Quaternion(1, 2, 3, 4).normalize()
      // Set the data as expected
      // @ts-expect-error Allow coercing the MockXRFrame type into the xrFrame property
      const xrFrame = new MockXRFrame() as XRFrame
      // xrFrame.getPose = () => undefined
      getMutableState(XRState).xrFrame.set(xrFrame)
      setComponent(testEntity, TransformComponent, { rotation: Initial })
      const plane = {} as XRPlane
      // Sanity check before running
      const before = getComponent(testEntity, TransformComponent).rotation.clone()
      assertVec.approxEq(before, Initial, 4)
      assertVec.anyApproxNotEq(before, Expected, 4)
      // Run and Check the result
      XRDetectedPlaneComponent.updatePlanePose(testEntity, plane)
      const result = getComponent(testEntity, TransformComponent).rotation.clone()
      assertVec.approxEq(result, Expected, 4)
    })

    it('should not do anything when XRState.xrFrame.getPose(`@param plane`.planeSpace, ReferenceSpace.localFloor) is falsy', () => {
      const Initial = new Vector3(1, 2, 3)
      const ChangedValue = new Vector3()
      // Set the data as expected
      // @ts-expect-error Allow coercing the MockXRFrame type into the xrFrame property
      const xrFrame = new MockXRFrame() as XRFrame
      xrFrame.getPose = () => undefined
      getMutableState(XRState).xrFrame.set(xrFrame)
      setComponent(testEntity, TransformComponent, { position: Initial })
      const plane = {} as XRPlane
      getState(XRState).xrFrame!.getPose(plane.planeSpace, ReferenceSpace.localFloor!)!
      // Sanity check before running
      const planePose = getState(XRState).xrFrame!.getPose(plane.planeSpace, ReferenceSpace.localFloor!)!
      expect(planePose).toBeFalsy()
      const before = getComponent(testEntity, TransformComponent).position.clone()
      assertVec.approxEq(before, Initial, 3)
      assertVec.anyApproxNotEq(before, ChangedValue, 3)
      // Run and Check the result
      XRDetectedPlaneComponent.updatePlanePose(testEntity, plane)
      const result = getComponent(testEntity, TransformComponent).position.clone()
      assertVec.approxEq(result, Initial, 3)
      assertVec.anyApproxNotEq(result, ChangedValue, 3)
    })
  }) //:: updatePlanePose

  describe('foundPlane', () => {
    beforeEach(async () => {
      createEngine()
      mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should set the XRDetectedPlaneComponent.detectedPlanesMap entry for the `@param plane` to have the newly created entity', () => {
      // Set the data as expected
      const plane = {} as XRPlane
      const before = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedPlaneComponent.foundPlane(plane)
      const result = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
    })

    it('should add an EntityTreeComponent to the new entity and set its parentEntity to ReferenceSpaceState.localFloorEntity', () => {
      // Set the data as expected
      const plane = {} as XRPlane
      const before = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedPlaneComponent.foundPlane(plane)
      const result = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      assert(result)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
      expect(hasComponent(result, EntityTreeComponent)).toBe(true)
      expect(getComponent(result, EntityTreeComponent).parentEntity).toBe(
        getState(ReferenceSpaceState).localFloorEntity
      )
    })

    it('should add TransformComponent to the new entity', () => {
      // Set the data as expected
      const plane = {} as XRPlane
      const before = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedPlaneComponent.foundPlane(plane)
      const result = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      assert(result)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
      expect(hasComponent(result, TransformComponent)).toBe(true)
    })

    it('should add a VisibleComponent to the new entity', () => {
      // Set the data as expected
      const plane = {} as XRPlane
      const before = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedPlaneComponent.foundPlane(plane)
      const result = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      assert(result)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
      expect(hasComponent(result, VisibleComponent)).toBe(true)
    })

    it("should add a NameComponent to the new entity with a value of 'plane-'+planeId", () => {
      // Set the data as expected
      const plane = {} as XRPlane
      const before = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedPlaneComponent.foundPlane(plane)
      const result = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      assert(result)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
      expect(hasComponent(result, NameComponent)).toBe(true)
      expect(getComponent(result, NameComponent).startsWith('plane-')).toBe(true)
    })

    it('should add a XRDetectedPlaneComponent to the new entity with `@param plane` as its XRDetectedPlaneComponent.plane property', () => {
      // Set the data as expected
      const plane = {} as XRPlane
      const before = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedPlaneComponent.foundPlane(plane)
      const result = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      assert(result)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
      expect(hasComponent(result, XRDetectedPlaneComponent)).toBe(true)
      expect(getComponent(result, XRDetectedPlaneComponent).plane).toBe(plane)
    })

    it('should set XRDetectedPlaneComponent.planesLastChangedTimes for the plane to the value of `@param plane`.lastChangedTime', () => {
      const Expected = 42
      // Set the data as expected
      const plane = { lastChangedTime: Expected } as XRPlane
      const before = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedPlaneComponent.foundPlane(plane)
      const entity = XRDetectedPlaneComponent.detectedPlanesMap.get(plane)
      assert(entity)
      expect(entity).not.toBe(undefined)
      expect(entity).not.toBe(UndefinedEntity)
      const result = XRDetectedPlaneComponent.planesLastChangedTimes.get(plane)
      expect(result).toBe(Expected)
    })
  }) //:: foundPlane

  /** @todo */
  describe('reactor', () => {}) //:: reactor
}) //:: XRDetectedPlaneComponent
