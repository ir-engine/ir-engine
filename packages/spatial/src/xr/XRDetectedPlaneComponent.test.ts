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
import { MockXRFrame, MockXRPlane, MockXRSpace } from '../../tests/util/MockXR'
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
import { Color, Matrix4, Quaternion, Vector3 } from 'three'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { TransformComponent } from '../SpatialModule'
import { NameComponent } from '../common/NameComponent'
import { VisibleComponent } from '../renderer/components/VisibleComponent'
import {
  XRDetectedPlaneComponent,
  XRDetectedPlaneComponentState,
  placementHelperMaterial,
  shadowMaterial
} from './XRDetectedPlaneComponent'
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
    beforeEach(async () => {
      createEngine()
      mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should set XRDetectedPlaneComponentState.planesLastChangedTimes for the plane to the value of `@param plane`.lastChangedTime', () => {
      const state = getState(XRDetectedPlaneComponentState)
      const plane = new MockXRPlane()
      plane.lastChangedTime = 42
      const before = state.planesLastChangedTimes.get(plane)
      expect(before).toBe(undefined)
      // Run and Check the result
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      XRDetectedPlaneComponent.updatePlaneGeometry(planeEntity)
      const after = state.planesLastChangedTimes.get(plane)
      expect(after).toBe(42)
    })

    it('should call createGeometryFromPolygon and assign the newly created geometry to `@param entity`.XRDetectedPlaneComponent.geometry', () => {
      const plane = new MockXRPlane()
      const polygon = [new Vector3(1, 2, 3), new Vector3(4, 5, 6), new Vector3(7, 8, 9)] as any as DOMPointReadOnly[]
      plane.polygon = polygon
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      XRDetectedPlaneComponent.updatePlaneGeometry(planeEntity)
      const planeComponent = getComponent(planeEntity, XRDetectedPlaneComponent)
      expect(planeComponent.geometry.isBufferGeometry).toBe(true)
      assert(planeComponent.geometry.index)
      expect(planeComponent.geometry.index.array.length).toBe(3)
      expect(planeComponent.geometry.attributes.position.array.length).toBe(9)
      expect(planeComponent.geometry.attributes.uv.array.length).toBe(6)
      expect(planeComponent.geometry.attributes.position.array).toEqual(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]))
      expect(planeComponent.geometry.attributes.uv.array).toEqual(new Float32Array([1, 3, 4, 6, 7, 9]))
    })
  }) //:: updatePlaneGeometry

  describe('updatePlanePose', () => {
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
      const plane = new MockXRPlane()
      const position = new Vector3(1, 2, 3)
      const quaternion = new Quaternion(1, 2, 3, 4).normalize()
      const pose = new Matrix4().compose(position, quaternion, new Vector3(1, 1, 1))
      plane.planeSpace = new MockXRSpace(pose)
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      XRDetectedPlaneComponent.updatePlanePose(planeEntity)
      const transform = getComponent(planeEntity, TransformComponent)
      assertVec.approxEq(transform.position, position, 3, 0.001)
    })

    it('should update the TransformComponent.rotation of the `@param entity` with the value of PlanePose.transform.rotation', () => {
      const plane = new MockXRPlane()
      const position = new Vector3(1, 2, 3)
      const quaternion = new Quaternion(1, 2, 3, 4).normalize()
      const pose = new Matrix4().compose(position, quaternion, new Vector3(1, 1, 1))
      plane.planeSpace = new MockXRSpace(pose)
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      XRDetectedPlaneComponent.updatePlanePose(planeEntity)
      const transform = getComponent(planeEntity, TransformComponent)
      assertVec.approxEq(transform.rotation, quaternion, 4, 0.001)
    })

    it('should not do anything when XRState.xrFrame.getPose(`@param plane`.planeSpace, ReferenceSpace.localFloor) is falsy', () => {
      // @ts-expect-error Allow coercing the MockXRFrame type into the xrFrame property
      const xrFrame = new MockXRFrame() as XRFrame
      xrFrame.getPose = () => undefined
      getMutableState(XRState).xrFrame.set(xrFrame)
      const plane = new MockXRPlane()
      const position = new Vector3(1, 2, 3)
      const quaternion = new Quaternion(1, 2, 3, 4).normalize()
      const pose = new Matrix4().compose(position, quaternion, new Vector3(1, 1, 1))
      plane.planeSpace = new MockXRSpace(pose)
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      // Sanity check before running
      const planePose = getState(XRState).xrFrame!.getPose(plane.planeSpace, ReferenceSpace.localFloor!)!
      expect(planePose).toBeFalsy()
      const transform = getComponent(planeEntity, TransformComponent)
      expect(transform.position.x).toBe(0)
      expect(transform.position.y).toBe(0)
      expect(transform.position.z).toBe(0)
      expect(transform.rotation.x).toBe(0)
      expect(transform.rotation.y).toBe(0)
      expect(transform.rotation.z).toBe(0)
      expect(transform.rotation.w).toBe(1)

      // Run and Check the result
      XRDetectedPlaneComponent.updatePlanePose(planeEntity)
      expect(transform.position.x).toBe(0)
      expect(transform.position.y).toBe(0)
      expect(transform.position.z).toBe(0)
      expect(transform.rotation.x).toBe(0)
      expect(transform.rotation.y).toBe(0)
      expect(transform.rotation.z).toBe(0)
      expect(transform.rotation.w).toBe(1)
    })
  }) //:: updatePlanePose

  describe('getPlaneEntity', () => {
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
      const state = getState(XRDetectedPlaneComponentState)
      const plane = new MockXRPlane()
      const before = state.detectedPlanesMap.get(plane)
      expect(before).toBe(undefined)
      // Run and Check the result
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      const result = state.detectedPlanesMap.get(plane)
      expect(result).toBe(planeEntity)
    })

    it('should add an EntityTreeComponent to the new entity and set its parentEntity to ReferenceSpaceState.localFloorEntity', () => {
      const plane = new MockXRPlane()
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      expect(planeEntity).not.toBe(UndefinedEntity)
      expect(hasComponent(planeEntity, EntityTreeComponent)).toBe(true)
      const localFloorEntity = getState(ReferenceSpaceState).localFloorEntity
      expect(getComponent(planeEntity, EntityTreeComponent).parentEntity).toBe(localFloorEntity)
    })

    it('should add TransformComponent to the new entity', () => {
      const plane = new MockXRPlane()
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      expect(planeEntity).not.toBe(UndefinedEntity)
      expect(hasComponent(planeEntity, TransformComponent)).toBe(true)
    })

    it('should add a VisibleComponent to the new entity', () => {
      const plane = new MockXRPlane()
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      expect(planeEntity).not.toBe(UndefinedEntity)
      expect(hasComponent(planeEntity, VisibleComponent)).toBe(true)
    })

    it("should add a NameComponent to the new entity with a value of 'xrplane-*'", () => {
      const plane = new MockXRPlane()
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      expect(planeEntity).not.toBe(UndefinedEntity)
      expect(hasComponent(planeEntity, NameComponent)).toBe(true)
      const name = getComponent(planeEntity, NameComponent)
      expect(name.startsWith('xrplane-')).toBe(true)
    })

    it('should add a XRDetectedPlaneComponent to the new entity with `@param plane` as its XRDetectedPlaneComponent.plane property', () => {
      const plane = new MockXRPlane()
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      expect(planeEntity).not.toBe(UndefinedEntity)
      expect(hasComponent(planeEntity, XRDetectedPlaneComponent)).toBe(true)
      const planeComponent = getComponent(planeEntity, XRDetectedPlaneComponent)
      expect(planeComponent.plane).toBe(plane)
    })

    it('should set XRDetectedPlaneComponent.planesLastChangedTimes for the plane to the value of `@param plane`.lastChangedTime', () => {
      const state = getState(XRDetectedPlaneComponentState)
      const plane = new MockXRPlane()
      plane.lastChangedTime = 4200
      const planeEntity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      expect(planeEntity).not.toBe(UndefinedEntity)
      expect(state.planesLastChangedTimes.get(plane)).toBe(-1)
      XRDetectedPlaneComponent.updatePlaneGeometry(planeEntity)
      expect(state.planesLastChangedTimes.get(plane)).toBe(4200)
    })
  }) //:: foundPlane

  /** @todo */
  describe('reactor', () => {}) //:: reactor
}) //:: XRDetectedPlaneComponent
