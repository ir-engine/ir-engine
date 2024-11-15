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

import {
  AnimationSystemGroup,
  Entity,
  SystemDefinitions,
  SystemUUID,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getMutableComponent,
  hasComponent,
  hasComponents,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState, startReactor } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import assert from 'assert'
import sinon from 'sinon'
import { Box3, BoxGeometry, Group, Matrix4, Mesh, Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { MockXRFrame } from '../../../tests/util/MockXR'
import { assertArray, assertVec } from '../../../tests/util/assert'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { EngineState } from '../../EngineState'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { destroySpatialEngine } from '../../initializeEngine'
import { GroupComponent, addObjectToGroup } from '../../renderer/components/GroupComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { XRState } from '../../xr/XRState'
import { TransformSerialization } from '../TransformSerialization'
import { BoundingBoxComponent } from '../components/BoundingBoxComponents'
import { ComputedTransformComponent } from '../components/ComputedTransformComponent'
import { DistanceFromCameraComponent, FrustumCullCameraComponent } from '../components/DistanceComponents'
import { EntityTreeComponent } from '../components/EntityTree'
import { TransformComponent } from '../components/TransformComponent'
import { TransformDirtyCleanupSystem, TransformDirtyUpdateSystem, TransformSystem } from './TransformSystem'

describe('TransformSystem', () => {
  const System = SystemDefinitions.get(TransformSystem)!
  const CleanupSystem = SystemDefinitions.get(TransformDirtyCleanupSystem)!
  const UpdateSystem = SystemDefinitions.get(TransformDirtyUpdateSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.TransformSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      assert.equal(TransformSystem, 'ee.engine.TransformSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.after, undefined)
      assert.equal(System.insert!.after!, AnimationSystemGroup)
    })
  }) //:: Fields

  describe('execute', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should call computeTransformMatrix for all sorted entities that are true in the TransformComponent.dirtyTransforms list', () => {
      const spy = sinon.spy()
      // Set the data as expected
      const entities: Entity[] = [createEntity(), createEntity(), createEntity(), createEntity()]
      for (const entity of entities) {
        setComponent(entity, TransformComponent)
        setComponent(entity, ComputedTransformComponent, { computeFunction: spy })
      }
      UpdateSystem.execute()
      // Sanity check before running
      assert.notEqual(spy.callCount, entities.length)
      // Run and Check the result
      System.execute()
      assert.equal(spy.callCount, entities.length)
    })

    it('should call updateGroupChildren for all entities that have the components [GroupComponent, VisibleComponent] and are true in the TransformComponent.dirtyTransforms list', () => {
      const Initial = true
      const Expected = !Initial
      // Set the data as expected
      const entities: Entity[] = [createEntity(), createEntity(), createEntity(), createEntity()]
      const objCount: number = 2
      for (const entity of entities) {
        setComponent(entity, VisibleComponent)
        setComponent(entity, TransformComponent)
        for (let id = 0; id < objCount; ++id) {
          const obj = new Mesh(new BoxGeometry())
          obj.matrixWorldNeedsUpdate = Initial
          const group = new Group()
          group.children = [obj]
          addObjectToGroup(entity, group)
        }
      }
      // Sanity check before running
      for (const entity of entities) {
        assert.equal(hasComponents(entity, [GroupComponent, VisibleComponent]), true)
        for (const group of getComponent(entity, GroupComponent))
          for (const child of group.children) assert.equal(child.matrixWorldNeedsUpdate, Initial)
      }
      // Run and Check the result
      System.execute()
      for (const entity of entities) {
        for (const group of getComponent(entity, GroupComponent))
          for (const child of group.children) assert.equal(child.matrixWorldNeedsUpdate, Expected)
      }
    })

    it('should call updateBoundingBox for all entities that have a BoundingBoxComponent and are true in the TransformComponent.dirtyTransforms list', () => {
      const Initial = new Box3()
      const Expected = new Box3(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5))
      // Set the data as expected
      const parentEntity = createEntity()
      setComponent(parentEntity, TransformComponent)
      const entities: Entity[] = [createEntity(), createEntity(), createEntity(), createEntity()]
      for (const entity of entities) {
        setComponent(entity, EntityTreeComponent, { parentEntity: parentEntity })
        setComponent(entity, VisibleComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, BoundingBoxComponent)
        const obj = new Mesh(new BoxGeometry(1, 1, 1))
        setComponent(entity, MeshComponent, obj)
      }
      // Sanity check before running
      for (const entity of entities) {
        assert.equal(hasComponent(entity, BoundingBoxComponent), true)
        const box = getComponent(entity, BoundingBoxComponent).box
        assertVec.approxEq(box.max, Initial.max, 3)
        assertVec.approxEq(box.min, Initial.min, 3)
      }
      // Run and Check the result
      System.execute()
      for (const entity of entities) {
        const box = getComponent(entity, BoundingBoxComponent).box
        assertVec.approxEq(box.max, Expected.max, 3)
        assertVec.approxEq(box.min, Expected.min, 3)
      }
    })

    describe('for all entities that have the components [TransformComponent, CameraComponent]', () => {
      it(".. should update the entity's CameraComponent.matrixWorldInverse based on its CameraComponent.matrixWorld", () => {
        const position = new Vector3(1, 2, 3)
        const rotation = new Quaternion(4, 5, 6, 7).normalize()
        const scale = new Vector3(8, 9, 10)
        const Initial = new Matrix4().compose(position, rotation, scale)
        const Expected = Initial.clone().invert()
        // Set the data as expected
        const entities: Entity[] = [createEntity(), createEntity(), createEntity()]
        for (const entity of entities) {
          setComponent(entity, TransformComponent)
          setComponent(entity, CameraComponent)
          getMutableComponent(entity, CameraComponent).matrixWorld.set(Initial)
        }
        // Sanity check before running
        for (const entity of entities) {
          assert.equal(hasComponent(entity, TransformComponent), true)
          assert.equal(hasComponent(entity, CameraComponent), true)
          const before = getComponent(entity, CameraComponent).matrixWorld.elements
          assertArray.eq(before, Initial.elements)
        }
        // Run and Check the results
        System.execute()
        for (const entity of entities) {
          const result = getComponent(entity, CameraComponent).matrixWorldInverse.elements
          assertArray.anyNotEq(result, Expected.elements)
        }
      })

      it(".. should copy the entity's CameraComponent.matrixWorld into its CameraComponent.cameras[0].matrixWorld", () => {
        const position = new Vector3(1, 2, 3)
        const rotation = new Quaternion(4, 5, 6, 7).normalize()
        const scale = new Vector3(8, 9, 10)
        const Expected = new Matrix4().compose(position, rotation, scale)
        // Set the data as expected
        const entities: Entity[] = [createEntity(), createEntity(), createEntity()]
        for (const entity of entities) {
          setComponent(entity, TransformComponent)
          setComponent(entity, CameraComponent)
          getMutableComponent(entity, CameraComponent).matrixWorld.set(Expected)
        }
        // Sanity check before running
        for (const entity of entities) {
          assert.equal(hasComponent(entity, TransformComponent), true)
          assert.equal(hasComponent(entity, CameraComponent), true)
          const before = getComponent(entity, CameraComponent).cameras[0].matrixWorld.elements
          assertArray.anyNotEq(before, Expected.elements)
        }
        // Run and Check the results
        System.execute()
        for (const entity of entities) {
          const result = getComponent(entity, CameraComponent).cameras[0].matrixWorld.elements
          assertArray.eq(result, Expected.elements)
        }
      })

      it(".. should copy the entity's CameraComponent.matrixWorldInverse into its CameraComponent.cameras[0].matrixWorldInverse", () => {
        const position = new Vector3(1, 2, 3)
        const rotation = new Quaternion(4, 5, 6, 7).normalize()
        const scale = new Vector3(8, 9, 10)
        const Initial = new Matrix4().compose(position, rotation, scale)
        const Expected = Initial.clone().invert()
        // Set the data as expected
        const entities: Entity[] = [createEntity(), createEntity(), createEntity()]
        for (const entity of entities) {
          setComponent(entity, TransformComponent)
          setComponent(entity, CameraComponent)
          getMutableComponent(entity, CameraComponent).matrixWorld.set(Initial)
        }
        // Sanity check before running
        for (const entity of entities) {
          assert.equal(hasComponent(entity, TransformComponent), true)
          assert.equal(hasComponent(entity, CameraComponent), true)
          const before = getComponent(entity, CameraComponent).cameras[0].matrixWorldInverse.elements
          assertArray.anyNotEq(before, Initial.elements)
        }
        // Run and Check the results
        System.execute()
        for (const entity of entities) {
          const result = getComponent(entity, CameraComponent).cameras[0].matrixWorldInverse.elements
          assertArray.eq(result, Expected.elements)
          assertArray.eq(result, getComponent(entity, CameraComponent).matrixWorldInverse.elements)
        }
      })

      it(".. should copy the entity's CameraComponent.projectionMatrix into its CameraComponent.cameras[0].projectionMatrix", () => {
        const position = new Vector3(1, 2, 3)
        const rotation = new Quaternion(4, 5, 6, 7).normalize()
        const scale = new Vector3(8, 9, 10)
        const Expected = new Matrix4().compose(position, rotation, scale)
        // Set the data as expected
        const entities: Entity[] = [createEntity(), createEntity(), createEntity()]
        for (const entity of entities) {
          setComponent(entity, TransformComponent)
          setComponent(entity, CameraComponent)
          getMutableComponent(entity, CameraComponent).projectionMatrix.set(Expected)
        }
        // Sanity check before running
        for (const entity of entities) {
          assert.equal(hasComponent(entity, TransformComponent), true)
          assert.equal(hasComponent(entity, CameraComponent), true)
          const before = getComponent(entity, CameraComponent).cameras[0].projectionMatrix.elements
          assertArray.anyNotEq(before, Expected.elements)
        }
        // Run and Check the results
        System.execute()
        for (const entity of entities) {
          const result = getComponent(entity, CameraComponent).cameras[0].projectionMatrix.elements
          assertArray.eq(result, Expected.elements)
          assertArray.eq(result, getComponent(entity, CameraComponent).projectionMatrix.elements)
        }
      })

      it(".. should copy the entity's CameraComponent.projectionMatrixInverse into its CameraComponent.cameras[0].projectionMatrixInverse", () => {
        const position = new Vector3(1, 2, 3)
        const rotation = new Quaternion(4, 5, 6, 7).normalize()
        const scale = new Vector3(8, 9, 10)
        const Expected = new Matrix4().compose(position, rotation, scale)
        // Set the data as expected
        const entities: Entity[] = [createEntity(), createEntity(), createEntity()]
        for (const entity of entities) {
          setComponent(entity, TransformComponent)
          setComponent(entity, CameraComponent)
          getMutableComponent(entity, CameraComponent).projectionMatrixInverse.set(Expected)
        }
        // Sanity check before running
        for (const entity of entities) {
          assert.equal(hasComponent(entity, TransformComponent), true)
          assert.equal(hasComponent(entity, CameraComponent), true)
          const before = getComponent(entity, CameraComponent).cameras[0].projectionMatrixInverse.elements
          assertArray.anyNotEq(before, Expected.elements)
        }
        // Run and Check the results
        System.execute()
        for (const entity of entities) {
          const result = getComponent(entity, CameraComponent).cameras[0].projectionMatrixInverse.elements
          assertArray.eq(result, Expected.elements)
          assertArray.eq(result, getComponent(entity, CameraComponent).projectionMatrixInverse.elements)
        }
      })

      it('.. should not do anything for the EngineState.viewerEntity when both itself and XSState.xrFrame are truthy', () => {
        const position = new Vector3(1, 2, 3)
        const rotation = new Quaternion(4, 5, 6, 7).normalize()
        const scale = new Vector3(8, 9, 10)
        const Initial = new Matrix4().compose(position, rotation, scale)
        const viewerEntity = getState(EngineState).viewerEntity
        // Set the data as expected
        // @ts-ignore Coerce the mocked XRFrame into XRState
        getMutableState(XRState).xrFrame.set(new MockXRFrame())
        getMutableComponent(viewerEntity, CameraComponent).matrixWorld.set(Initial)
        // Sanity check before running
        assert.equal(Boolean(viewerEntity), true)
        assert.equal(Boolean(getState(XRState).xrFrame), true)
        assert.equal(hasComponent(viewerEntity, TransformComponent), true)
        assert.equal(hasComponent(viewerEntity, CameraComponent), true)
        const before = getComponent(viewerEntity, CameraComponent).matrixWorld.elements
        assertArray.eq(before, Initial.elements)
        // Run and Check the results
        System.execute()
        const result = getComponent(viewerEntity, CameraComponent).matrixWorldInverse.elements
        assertArray.anyNotEq(result, Initial.elements)
      })
    })

    describe('when EngineState.viewerEntity is truthy ...', () => {
      describe('... for every entity that has the components [TransformComponent, DistanceFromCameraComponent]', () => {
        it('.. should set DistanceFromCameraComponent.squaredDistance[entity] to the output of getDistanceSquaredFromTarget(entity, EngineState.viewerEntity.TransformComponent.position )', () => {
          const Initial = 23
          const Expected = 5292
          const viewerEntity = getState(EngineState).viewerEntity
          // Set the data as expected
          setComponent(viewerEntity, TransformComponent, { position: new Vector3().setScalar(42) })
          const entities: Entity[] = [createEntity(), createEntity(), createEntity()]
          for (const entity of entities) {
            setComponent(entity, TransformComponent)
            setComponent(entity, DistanceFromCameraComponent)
            getMutableComponent(entity, DistanceFromCameraComponent).squaredDistance.set(Initial)
          }
          // Sanity check before running
          for (const entity of entities) {
            assert.equal(Boolean(viewerEntity), true)
            const before = setComponent(entity, DistanceFromCameraComponent).squaredDistance
            assert.equal(before, Initial)
            assert.notEqual(before, Expected)
          }
          // Run and Check the results
          System.execute()
          for (const entity of entities) {
            const result = setComponent(entity, DistanceFromCameraComponent).squaredDistance
            assert.notEqual(result, Initial)
            assert.equal(result, Expected)
          }
        })
      })

      describe('... for every entity that has the components [TransformComponent, FrustumCullCameraComponent]', () => {
        it(".. should set FrustumCullCameraComponent.isCulled for the entity if it does not have a BoundingBoxComponent and the worldPosition of the entity is contained in the frustrum of the viewerEntity's camera", () => {
          const Initial = 0
          const Expected = 1
          const viewerEntity = getState(EngineState).viewerEntity
          // Set the data as expected
          const entities: Entity[] = [createEntity(), createEntity(), createEntity()]
          for (const entity of entities) {
            setComponent(entity, TransformComponent)
            setComponent(entity, FrustumCullCameraComponent)
            // setComponent(entity, BoundingBoxComponent)  // Do not set a bounding box, so we hit the `:` branch when frustum culling
          }
          // Sanity check before running
          for (const entity of entities) {
            assert.equal(Boolean(viewerEntity), true)
            assert.equal(hasComponent(entity, BoundingBoxComponent), false)
            const before = FrustumCullCameraComponent.isCulled[entity]
            assert.equal(before, Initial)
            assert.notEqual(before, Expected)
          }
          // Run and Check the results
          System.execute()
          for (const entity of entities) {
            const result = FrustumCullCameraComponent.isCulled[entity]
            assert.notEqual(result, Initial)
            assert.equal(result, Expected)
          }
        })

        it(".. should set FrustumCullCameraComponent.isCulled for the entity if it has a BoundingBoxComponent and its .box intersect with the frustrum of the viewerEntity's camera", () => {
          const Initial = 0
          const Expected = 1
          const viewerEntity = getState(EngineState).viewerEntity
          // Set the data as expected
          const entities: Entity[] = [createEntity(), createEntity(), createEntity()]
          for (const entity of entities) {
            setComponent(entity, TransformComponent, { position: new Vector3(0, 0, 2) })
            setComponent(entity, FrustumCullCameraComponent)
            setComponent(entity, MeshComponent, new Mesh(new BoxGeometry(1, 1, 1)))
            addObjectToGroup(entity, getComponent(entity, MeshComponent))
            setComponent(entity, BoundingBoxComponent) // Set a bounding box, so we hit the `?` branch when frustum culling
          }
          // Sanity check before running
          for (const entity of entities) {
            assert.equal(Boolean(viewerEntity), true)
            assert.equal(hasComponent(entity, BoundingBoxComponent), true)
            const before = FrustumCullCameraComponent.isCulled[entity]
            assert.equal(before, Initial)
            assert.notEqual(before, Expected)
          }
          // Run and Check the results
          System.execute()
          for (const entity of entities) {
            const result = FrustumCullCameraComponent.isCulled[entity]
            assert.notEqual(result, Initial)
            assert.equal(result, Expected)
          }
        })
      })
    })

    describe('when EngineState.viewerEntity is falsy ...', () => {
      describe('... for every entity that has the components [TransformComponent, DistanceFromCameraComponent]', () => {
        it('.. should not set DistanceFromCameraComponent.squaredDistance[entity] to the output of getDistanceSquaredFromTarget(entity, EngineState.viewerEntity.TransformComponent.position )', () => {
          const Initial = 23
          getMutableState(EngineState).viewerEntity.set(UndefinedEntity)
          const viewerEntity = getState(EngineState).viewerEntity
          // Set the data as expected
          const entities: Entity[] = [createEntity(), createEntity(), createEntity()]
          for (const entity of entities) {
            setComponent(entity, TransformComponent)
            setComponent(entity, DistanceFromCameraComponent)
            getMutableComponent(entity, DistanceFromCameraComponent).squaredDistance.set(Initial)
          }
          // Sanity check before running
          for (const entity of entities) {
            assert.equal(Boolean(viewerEntity), false)
            const before = setComponent(entity, DistanceFromCameraComponent).squaredDistance
            assert.equal(before, Initial)
          }
          // Run and Check the results
          System.execute()
          for (const entity of entities) {
            const result = setComponent(entity, DistanceFromCameraComponent).squaredDistance
            assert.equal(result, Initial)
          }
        })
      })

      describe('... for every entity that has the components [TransformComponent, FrustumCullCameraComponent]', () => {
        it(".. should not set FrustumCullCameraComponent.isCulled for the entity if it does not have a BoundingBoxComponent and the worldPosition of the entity is contained in the frustrum of the viewerEntity's camera", () => {
          const Initial = 0
          getMutableState(EngineState).viewerEntity.set(UndefinedEntity)
          const viewerEntity = getState(EngineState).viewerEntity
          // Set the data as expected
          const entities: Entity[] = [createEntity(), createEntity(), createEntity()]
          for (const entity of entities) {
            setComponent(entity, TransformComponent)
            setComponent(entity, FrustumCullCameraComponent)
            // setComponent(entity, BoundingBoxComponent)  // Do not set a bounding box, so we hit the `:` branch when frustum culling
          }
          // Sanity check before running
          for (const entity of entities) {
            assert.equal(Boolean(viewerEntity), false)
            assert.equal(hasComponent(entity, BoundingBoxComponent), false)
            const before = FrustumCullCameraComponent.isCulled[entity]
            assert.equal(before, Initial)
          }
          // Run and Check the results
          System.execute()
          for (const entity of entities) {
            const result = FrustumCullCameraComponent.isCulled[entity]
            assert.equal(result, Initial)
          }
        })

        it(".. should not set FrustumCullCameraComponent.isCulled for the entity if it has a BoundingBoxComponent and its .box intersect with the frustrum of the viewerEntity's camera", () => {
          const Initial = 0
          const Expected = Initial
          getMutableState(EngineState).viewerEntity.set(UndefinedEntity)
          const viewerEntity = getState(EngineState).viewerEntity
          // Set the data as expected
          const entities: Entity[] = [createEntity(), createEntity(), createEntity()]
          for (const entity of entities) {
            setComponent(entity, TransformComponent, { position: new Vector3(0, 0, 2) })
            setComponent(entity, FrustumCullCameraComponent)
            setComponent(entity, MeshComponent, new Mesh(new BoxGeometry(1, 1, 1)))
            addObjectToGroup(entity, getComponent(entity, MeshComponent))
            setComponent(entity, BoundingBoxComponent) // Set a bounding box, so we hit the `?` branch when frustum culling
          }
          // Sanity check before running
          for (const entity of entities) {
            assert.equal(Boolean(viewerEntity), false)
            assert.equal(hasComponent(entity, BoundingBoxComponent), true)
            const before = FrustumCullCameraComponent.isCulled[entity]
            assert.equal(before, Initial)
          }
          // Run and Check the results
          System.execute()
          for (const entity of entities) {
            const result = FrustumCullCameraComponent.isCulled[entity]
            assert.equal(result, Expected)
          }
        })
      })
    })
  }) //:: execute

  describe('reactor', () => {
    describe('mount/unmount', () => {
      let testEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        testEntity = createEntity()
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      const systemReactor = System.reactor!

      it('should set NetworkState.networkSchema[TransformSerialization.ID] when it mounts', () => {
        const before = getState(NetworkState).networkSchema[TransformSerialization.ID]
        assert.equal(before, undefined)
        // Run and Check the result
        const root = startReactor(systemReactor)
        const after = getState(NetworkState).networkSchema[TransformSerialization.ID]
        assert.notEqual(after, undefined)
      })

      it('should set NetworkState.networkSchema[TransformSerialization.ID] to none when it unmounts', () => {
        const before = getState(NetworkState).networkSchema[TransformSerialization.ID]
        assert.equal(before, undefined)
        // Run and Check the result
        const root = startReactor(systemReactor)
        const after = getState(NetworkState).networkSchema[TransformSerialization.ID]
        assert.notEqual(after, undefined)
        root.stop()
        const result = getState(NetworkState).networkSchema[TransformSerialization.ID]
        assert.equal(result, undefined)
      })
    }) //:: mount/unmount
  }) //:: reactor
}) //:: TransformSystem

describe('TransformDirtyUpdateSystem', () => {
  const System = SystemDefinitions.get(TransformDirtyUpdateSystem)!

  describe('Fields', () => {
    it('should initialize the ClientInputSystem.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.TransformDirtyUpdateSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      assert.equal(TransformDirtyUpdateSystem, 'ee.engine.TransformDirtyUpdateSystem' as SystemUUID)
    })

    it('should initialize the ClientInputSystem.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.before, undefined)
      assert.equal(System.insert!.before!, TransformSystem)
    })
  }) //:: Fields

  describe('execute', () => {
    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should set TransformComponent.transformsNeedSorting to false', () => {
      const Expected = false
      // Set the data as expected
      TransformComponent.transformsNeedSorting = !Expected
      // Sanity check before running
      const before = TransformComponent.transformsNeedSorting
      assert.notEqual(before, Expected)
      // Run and Check the result
      System.execute()
      const result = TransformComponent.transformsNeedSorting
      assert.equal(result, Expected)
    })

    it('should not change the dirtyTransforms value for each entity if its already true', () => {
      const Expected = true
      // Set the data as expected
      const entities: Entity[] = [
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity()
      ]
      for (const entity of entities) setComponent(entity, TransformComponent)
      // Sanity check before running
      for (const entity of entities) assert.equal(hasComponent(entity, TransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, ComputedTransformComponent), false)
      for (const entity of entities) assert.equal(hasComponent(entity, EntityTreeComponent), false)
      for (const entity of entities) assert.equal(TransformComponent.dirtyTransforms[entity], Expected)
      // Run and Check the result
      System.execute()
      for (const entity of entities) assert.equal(TransformComponent.dirtyTransforms[entity], Expected)
    })

    it('should set the dirtyTransforms value for each entity to true if the entity has a ComputedTransformComponent', () => {
      const Expected = true
      const Initial = !Expected
      // Set the data as expected
      const entities: Entity[] = [
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity()
      ]
      for (const entity of entities) setComponent(entity, TransformComponent)
      for (const entity of entities) setComponent(entity, ComputedTransformComponent)
      for (const entity of entities) TransformComponent.dirtyTransforms[entity] = Initial
      // Sanity check before running
      for (const entity of entities) assert.equal(hasComponent(entity, TransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, ComputedTransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, EntityTreeComponent), false)
      for (const entity of entities) assert.equal(TransformComponent.dirtyTransforms[entity], Initial)
      for (const entity of entities) assert.notEqual(TransformComponent.dirtyTransforms[entity], Expected)
      // Run and Check the result
      System.execute()
      for (const entity of entities) assert.equal(TransformComponent.dirtyTransforms[entity], Expected)
    })

    it('should set the dirtyTransforms value for each entity to true if the dirtyTransforms for its EntityTreeComponent.parentEntity is true', () => {
      const Expected = true
      const Initial = !Expected
      const entities: Entity[] = [
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity()
      ]
      const parents: Entity[] = []
      // Set the data as expected
      for (const id in entities) parents[id] = createEntity()
      for (const id in entities) setComponent(entities[id], EntityTreeComponent, { parentEntity: parents[id] })
      for (const entity of parents) setComponent(entity, TransformComponent)
      for (const entity of parents) TransformComponent.dirtyTransforms[entity] = Expected
      for (const entity of entities) setComponent(entity, TransformComponent)
      for (const entity of entities) setComponent(entity, ComputedTransformComponent)
      for (const entity of entities) TransformComponent.dirtyTransforms[entity] = Initial
      // Sanity check before running
      for (const entity of entities) assert.equal(hasComponent(entity, TransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, ComputedTransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, EntityTreeComponent), true)
      for (const entity of entities) assert.equal(TransformComponent.dirtyTransforms[entity], Initial)
      for (const entity of entities) assert.notEqual(TransformComponent.dirtyTransforms[entity], Expected)
      // Run and Check the result
      System.execute()
      for (const entity of entities) assert.equal(TransformComponent.dirtyTransforms[entity], Expected)
    })

    it('should set the dirtyTransforms value to false when none of the other conditions are true and the parent does not exist in the TransformComponent.dirtyTransforms list', () => {
      const Expected = false
      const Initial = undefined
      const entities: Entity[] = [
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity()
      ]
      const parents: Entity[] = []
      // Set the data as expected
      for (const id in entities) parents[id] = createEntity()
      for (const id in entities) setComponent(entities[id], EntityTreeComponent, { parentEntity: parents[id] })
      for (const entity of parents) setComponent(entity, TransformComponent)
      for (const entity of entities) setComponent(entity, TransformComponent)
      for (const entity of parents) delete TransformComponent.dirtyTransforms[entity]
      for (const entity of entities) delete TransformComponent.dirtyTransforms[entity]
      // Sanity check before running
      for (const entity of entities) assert.equal(hasComponent(entity, TransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, ComputedTransformComponent), false)
      for (const entity of entities) assert.equal(hasComponent(entity, EntityTreeComponent), true)
      for (const entity of entities) assert.equal(TransformComponent.dirtyTransforms[entity], Initial)
      for (const entity of parents) assert.equal(TransformComponent.dirtyTransforms[entity], Initial)
      // Run and Check the result
      System.execute()
      for (const entity of entities) assert.equal(TransformComponent.dirtyTransforms[entity], Expected)
    })
  }) //:: execute
}) //:: TransformDirtyUpdateSystem

describe('TransformDirtyCleanupSystem', () => {
  const System = SystemDefinitions.get(TransformDirtyCleanupSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.TransformDirtyCleanupSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      assert.equal(TransformDirtyCleanupSystem, 'ee.engine.TransformDirtyCleanupSystem' as SystemUUID)
    })

    it('should initialize the ClientInputSystem.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.after, undefined)
      assert.equal(System.insert!.after!, TransformSystem)
    })
  }) //:: Fields

  describe('execute', () => {
    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should remove every entity from the TransformComponent.dirtyTransforms list', () => {
      const count = 2
      const Initial = count + Object.entries(TransformComponent.dirtyTransforms).length
      const Expected = 0
      // Set the data as expected
      for (let id = 0; id < count; ++id) {
        const entity = createEntity()
        setComponent(entity, TransformComponent)
        TransformComponent.dirtyTransforms[entity] = true
      }
      // Sanity check before running
      assert.notEqual(Object.entries(TransformComponent.dirtyTransforms).length, Expected)
      assert.equal(Object.entries(TransformComponent.dirtyTransforms).length, Initial)
      // Run and Check the result
      System.execute()
      assert.equal(Object.entries(TransformComponent.dirtyTransforms).length, Expected)
    })
  }) //:: execute
}) //:: TransformDirtyCleanupSystem
