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
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getState, startReactor } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import assert from 'assert'
import { TransformSerialization } from '../TransformSerialization'
import { ComputedTransformComponent } from '../components/ComputedTransformComponent'
import { EntityTreeComponent } from '../components/EntityTree'
import { TransformComponent } from '../components/TransformComponent'
import { TransformDirtyCleanupSystem, TransformDirtyUpdateSystem, TransformSystem } from './TransformSystem'

describe('TransformSystem', () => {
  const System = SystemDefinitions.get(TransformSystem)!

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

  /** @todo */
  describe('execute', () => {
    // should call computeTransformMatrix for all sorted entities that are true in the TransformComponent.dirtyTransforms list
    // should call updateGroupChildren for all entities that have the components [GroupComponent, VisibleComponent] and are true in the TransformComponent.dirtyTransforms list
    // should call updateBoundingBox for all entities that have a BoundingBoxComponent and are true in the TransformComponent.dirtyTransforms list
    // for all entities that have the components [TransformComponent, CameraComponent]
    // .. should not do anything for the EngineState.viewerEntity
    // .. should update the entity's CameraComponent.matrixWorldInverse based on its CameraComponent.matrixWorld
    // .. should copy the entity's CameraComponent.matrixWorld into its CameraComponent.cameras[0].matrixWorld
    // .. should copy the entity's CameraComponent.matrixWorldInverse into its CameraComponent.cameras[0].matrixWorldInverse
    // .. should copy the entity's CameraComponent.projectionMatrix into its CameraComponent.cameras[0].projectionMatrix
    // .. should copy the entity's CameraComponent.projectionMatrixInverse into its CameraComponent.cameras[0].projectionMatrixInverse
    // TODO: when EngineState.viewerEntity is falsy
    // when EngineState.viewerEntity is truthy
    // for every entity that has the components [TransformComponent, DistanceFromCameraComponent]
    // .. should set DistanceFromCameraComponent.squaredDistance[entity] to the output of getDistanceSquaredFromTarget(entity, EngineState.viewerEntity.TransformComponent.position )
    // for every entity that has the components [TransformComponent, FrustumCullCameraComponent]
    // .. should set FrustumCullCameraComponent.isCulled for the entity if it has a BoundingBoxComponent and its .box intersect with the frustrum of the viewerEntity's camera
    // .. should set FrustumCullCameraComponent.isCulled for the entity if it does not have a BoundingBoxComponent and the worldPosition of the entity is contained in the frustrum of the viewerEntity's camera
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
