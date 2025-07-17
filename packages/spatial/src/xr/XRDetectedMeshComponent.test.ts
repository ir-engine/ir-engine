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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { MockXRFrame, MockXRMesh, MockXRPose, MockXRSpace } from '../../tests/util/MockXR'
import { assertVec } from '../../tests/util/assert'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'

import {
  EntityTreeComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { BoxGeometry, BufferGeometry, Matrix4, Mesh, Quaternion, Vector3 } from 'three'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { TransformComponent } from '../SpatialModule'
import { NameComponent } from '../common/NameComponent'
import { ObjectComponent } from '../renderer/components/ObjectComponent'
import { VisibleComponent } from '../renderer/components/VisibleComponent'
import { XRDetectedMeshComponent, XRDetectedMeshComponentState } from './XRDetectedMeshComponent'
import { ReferenceSpace, XRState } from './XRState'

// /** @note Runs once on the `describe` implied by vitest for this file */
// beforeAll(() => {
//   new CustomWebXRPolyfill()
// })

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
      // mockEmulatedXREngine()
    })

    afterEach(() => {
      // destroyEmulatedXREngine()
      destroyEngine()
    })

    // it('should set XRDetectedMeshComponentState.meshesLastChangedTimes for the mesh to the value of `@param mesh`.lastChangedTime', () => {
    //   const Expected = 42
    //   // Set the data as expected
    //   const state = getState(XRDetectedMeshComponentState)
    //   const mesh = { lastChangedTime: Expected } as XRMesh
    //   const before = state.meshesLastChangedTimes.get(mesh)
    //   expect(before).toBe(undefined)

    //   const entity = XRDetectedMeshComponent.getMeshEntity(mesh)
    //   const after = state.meshesLastChangedTimes.get(mesh)
    //   expect(after).toBe(-1)

    //   XRDetectedMeshComponent.updateMeshGeometry(entity)
    //   const result = state.meshesLastChangedTimes.get(mesh)
    //   expect(result).toBe(Expected)
    // })
  }) //:: updateMeshGeometry

  describe('updateMeshPose', () => {
    beforeEach(async () => {
      createEngine()
      // mockSpatialEngine()
      // await requestEmulatedXRSession()
    })

    afterEach(() => {
      // destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should update the TransformComponent.position of the `@param entity` with the value of PlanePose.transform.position', () => {
      const mesh = new MockXRMesh()
      const position = new Vector3(1, 2, 3)
      const quaternion = new Quaternion(1, 2, 3, 4).normalize()
      const pose = new Matrix4().compose(position, quaternion, new Vector3(1, 1, 1))
      // @ts-expect-error
      const xrFrame = new MockXRFrame() as XRFrame
      // @ts-expect-error
      xrFrame.getPose = () => new MockXRPose(position, quaternion)
      getMutableState(XRState).xrFrame.set(xrFrame)
      mesh.meshSpace = new MockXRSpace(pose)
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
      // @ts-expect-error
      const xrFrame = new MockXRFrame() as XRFrame
      // @ts-expect-error
      xrFrame.getPose = () => new MockXRPose(position, quaternion)
      getMutableState(XRState).xrFrame.set(xrFrame)
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

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    describe('XRDetectedMeshComponent.mesh', () => {
      it('should not do anything if XRDetectedMeshComponent.mesh.value is falsy', () => {
        const Expected = {} as XRMesh
        const Initial = undefined as XRMesh | undefined // @note Will have typeerrors due to geometry missing, but they are expected for this test case
        // Set the data as expected
        const resultSpy = vi.spyOn(XRDetectedMeshComponent, 'createGeometryFromMesh')
        // Sanity check before running
        expect(resultSpy).toHaveBeenCalledTimes(0)
        setComponent(testEntity, XRDetectedMeshComponent, { mesh: Initial })
        expect(resultSpy).toHaveBeenCalledTimes(0)
        expect(getComponent(testEntity, XRDetectedMeshComponent).mesh).toBeFalsy()
        // Run and Check the result
        setComponent(testEntity, XRDetectedMeshComponent, { mesh: Expected })
        expect(resultSpy).toHaveBeenCalledTimes(0)
      })

      it.only('should call XRDetectedMeshComponent.createGeometryFromMesh with XRDetectedMeshComponent.mesh.value as its argument', async () => {
        const Expected = {} as XRMesh
        const Initial = { semanticLabel: 'testLabel' } as XRMesh
        // Set the data as expected
        const resultSpy = vi.spyOn(XRDetectedMeshComponent, 'createGeometryFromMesh')
        // Sanity check before running
        expect(resultSpy).toHaveBeenCalledTimes(0)
        setComponent(testEntity, XRDetectedMeshComponent, { mesh: Initial })

        await flushAll()

        expect(resultSpy).toHaveBeenCalledTimes(1)
        expect(getComponent(testEntity, XRDetectedMeshComponent).mesh).toBeTruthy()

        // Run and Check the result
        setComponent(testEntity, XRDetectedMeshComponent, { mesh: Expected })

        await flushAll()

        expect(resultSpy).toHaveBeenCalledTimes(2)
        expect(resultSpy).toHaveBeenCalledWith(Expected)
      })

      it('should set XRDetectedMeshComponent.geometry to the newly created geometry', async () => {
        const Initial = new BufferGeometry()
        // Set the data as expected
        setComponent(testEntity, XRDetectedMeshComponent, {
          mesh: {
            vertices: new Float32Array(),
            indices: new Uint32Array(),
            semanticLabel: 'testLabelInitial'
          } as XRMesh
        })
        setComponent(testEntity, XRDetectedMeshComponent, { geometry: Initial })
        // Sanity check before running
        const before = getComponent(testEntity, XRDetectedMeshComponent).geometry
        expect(before).toBe(Initial)
        // Run and Check the result
        setComponent(testEntity, XRDetectedMeshComponent, {
          mesh: { vertices: new Float32Array(), indices: new Uint32Array(), semanticLabel: 'testLabelAfter' } as XRMesh
        })

        await flushAll()

        const result = getComponent(testEntity, XRDetectedMeshComponent).geometry
        expect(result).not.toBe(Initial) // A change in .mesh should trigger a change in .geometry
      })

      it(`should create a new Mesh object with XRDetectedMeshComponent.shadowMesh
          and set an ObjectComponent to the entityContext with the new mesh`, async () => {
        // Set the data as expected
        setComponent(testEntity, XRDetectedMeshComponent, {
          mesh: { vertices: new Float32Array(), indices: new Uint32Array(), semanticLabel: 'testLabel' } as XRMesh
        })

        await flushAll()

        // Sanity check before running
        const Initial = getComponent(testEntity, ObjectComponent).clone()
        // Run and Check the result
        setComponent(testEntity, XRDetectedMeshComponent, {
          mesh: { vertices: new Float32Array(), indices: new Uint32Array(), semanticLabel: 'testLabelAfter' } as XRMesh
        })

        await flushAll()

        expect(getComponent(testEntity, ObjectComponent)).not.toEqual(Initial)
        expect(getComponent(testEntity, ObjectComponent)).toBe(
          getComponent(testEntity, XRDetectedMeshComponent).shadowMesh
        )
      })

      describe('when it unmounts ..', () => {
        it('.. should call removeComponent with the entityContext', async () => {
          const Expected = false
          const Initial = !Expected
          // Set the data as expected
          setComponent(testEntity, XRDetectedMeshComponent, { mesh: { semanticLabel: 'testLabel' } as XRMesh })

          await flushAll()

          // Sanity check before running
          const before = hasComponent(testEntity, ObjectComponent)
          expect(before).toBe(Initial)
          // Run and Check the result

          removeComponent(testEntity, XRDetectedMeshComponent)

          await flushAll()

          const result = hasComponent(testEntity, ObjectComponent)
          expect(result).toBe(Expected)
        })
      })
    }) //:: XRDetectedMeshComponent.mesh

    describe('XRDetectedMeshComponent.geometry', () => {
      it('should set entityContext.XRDetectedMeshComponent.shadowMesh.geometry to entityContext.XRDetectedMeshComponent.geometry', () => {
        const Initial = new BufferGeometry()
        // Set the data as expected
        setComponent(testEntity, XRDetectedMeshComponent, {
          mesh: { semanticLabel: 'testLabel' } as XRMesh,
          geometry: new BoxGeometry(),
          shadowMesh: new Mesh()
        })
        // Run and Check the result
        setComponent(testEntity, XRDetectedMeshComponent, { geometry: new BoxGeometry() })
        const result = getComponent(testEntity, XRDetectedMeshComponent).shadowMesh.geometry
        expect(result).not.toBe(Initial)
      })

      describe('when it unmounts ..', () => {
        /** @todo How to get the cleanup code to run ?? */
        it.todo('.. should call entityContext.XRDetectedMeshComponent.geometry.dispose', () => {
          const resultSpy = vi.fn()
          setComponent(testEntity, XRDetectedMeshComponent, { geometry: new BoxGeometry() })
          getMutableComponent(testEntity, XRDetectedMeshComponent).geometry.merge({ dispose: resultSpy })
          expect(resultSpy).not.toHaveBeenCalled()
          setComponent(testEntity, XRDetectedMeshComponent, { geometry: new BoxGeometry() })
          expect(resultSpy).toHaveBeenCalledTimes(1)
        })
      })
    }) //:: XRDetectedMeshComponent.geometry

    /** @todo Write when this useEffect is not broken. It currently crashes the context, which makes the other hooks misbehave.
    describe('XRState.scenePlacementMode', () => {
      it.todo("should set XRDetectedMeshComponent.placementHelper.visible to true if XRState.scenePlacementMode is 'placing'", () => {})
      it.todo("should set XRDetectedMeshComponent.placementHelper.visible to false if XRState.scenePlacementMode is not 'placing'", () => {})
    }) //:: XRState.scenePlacementMode
    */
  }) //:: reactor
}) //:: XRDetectedMeshComponent
