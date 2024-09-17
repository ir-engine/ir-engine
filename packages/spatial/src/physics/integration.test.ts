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
  ECSState,
  Entity,
  SystemDefinitions,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { BoxGeometry, Mesh, Vector3 } from 'three'
import { mockSpatialEngine } from '../../tests/util/mockSpatialEngine'
import { addObjectToGroup } from '../renderer/components/GroupComponent'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { SceneComponent } from '../renderer/components/SceneComponents'
import { VisibleComponent } from '../renderer/components/VisibleComponent'
import { EntityTreeComponent } from '../transform/components/EntityTree'
import { TransformComponent } from '../transform/components/TransformComponent'
import {
  TransformDirtyCleanupSystem,
  TransformDirtyUpdateSystem,
  TransformSystem
} from '../transform/systems/TransformSystem'
import { PhysicsPreTransformSystem, PhysicsSystem } from './PhysicsModule'
import { Physics, PhysicsWorld } from './classes/Physics'
import { ColliderComponent } from './components/ColliderComponent'
import { RigidBodyComponent } from './components/RigidBodyComponent'
import { BodyTypes } from './types/PhysicsTypes'

/*
# Physics : Integration
We have a few situations:
- manipulating `rigidbodies` & `collider` transform hierarchies in the studio
  specifically, nested/complex entity hierarchies
- multi-scene coordinate space support    (demos are in the dev test suite)
  - XR locomotion demo
  - scene placement demo
  - multiple scenes demo
- physics based dynamic object movement & inter-physics frame transform interpolation

## Integration Test
Integration testing is defined as testing the result of multiple modules.
For the physics, the modules would be:
- `RigidbodyComponent`
- `ColliderComponent`
- `TransformComponent`
- `PhysicsSystem`
- `PhysicsPreTransformSystem`
- `TransformSystem`
We'd be asserting between system executes once the components are set up correctly

All it needs to be is:
- What was added for PhysicsSystem.test.ts with physicsSystemExecute()
- but for the three systems mentioned above, all in the same test

Systems Execution Order
1. InputSystemGroup         // executeSystem
2. SimulationSystemGroup    // executeFixedSystem
3. AnimationSystemGroup     // executeSystem
4. PresentationSystemGroup  // executeSystem
*/

describe('Integration : PhysicsSystem + PhysicsPreTransformSystem + TransformSystem', () => {
  const execute = {
    physicsSystem: SystemDefinitions.get(PhysicsSystem)!.execute, // with: SimulationSystemGroup
    transformDirtyUpdateSystem: SystemDefinitions.get(TransformDirtyUpdateSystem)!.execute, // before: TransformSystem
    physicsPreTransformSystem: SystemDefinitions.get(PhysicsPreTransformSystem)!.execute, // after: TransformDirtyUpdateSystem -> before: TransformSystem
    transformSystem: SystemDefinitions.get(TransformSystem)!.execute, // after: AnimationSystemGroup
    transformDirtyCleanupSystem: SystemDefinitions.get(TransformDirtyCleanupSystem)!.execute // before: TransformSystem
  }

  describe('Category 1 ', () => {
    let testEntity = UndefinedEntity
    let physicsWorldEntity = UndefinedEntity
    let physicsWorld: PhysicsWorld

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      await Physics.load()
      physicsWorldEntity = createEntity()
      setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
      setComponent(physicsWorldEntity, EntityTreeComponent)
      setComponent(physicsWorldEntity, SceneComponent)
      setComponent(physicsWorldEntity, TransformComponent)
      physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
      physicsWorld.timestep = 1 / 60

      testEntity = createEntity()
      execute.transformDirtyUpdateSystem()
      execute.transformSystem()
      execute.transformDirtyCleanupSystem()
    })

    afterEach(() => {
      removeEntity(testEntity)
      removeEntity(physicsWorldEntity)
      return destroyEngine()
    })

    type ResultData = Vector3
    type ResultEntry = {
      physicsSystem: ResultData
      physicsPreTransformSystem: ResultData
      transformSystem: ResultData
    }
    type Result = {
      before: ResultEntry
      after: ResultEntry
    }

    /**
     * @description
     * Creates a new {@link Vector3} object that contains a copy of the position components of the `@param entity`'s {@link TransformComponent}.matrix */
    function getPositionFromMatrix(entity: Entity): Vector3 {
      const matrix = getComponent(entity, TransformComponent).matrix.elements
      return new Vector3(matrix[12], matrix[13], matrix[14])
    }

    it("should commit pose modifications generated by the Physics into the entity's TransformComponent data", () => {
      const testImpulse = new Vector3(1, 2, 3)
      // Set the data as expected
      setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(testEntity, VisibleComponent)
      setComponent(testEntity, TransformComponent)
      const mesh = new Mesh(new BoxGeometry())
      addObjectToGroup(testEntity, mesh)
      setComponent(testEntity, MeshComponent, mesh)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      setComponent(testEntity, ColliderComponent)
      const Expected: Result = {
        before: {
          physicsSystem: getPositionFromMatrix(testEntity),
          physicsPreTransformSystem: getPositionFromMatrix(testEntity),
          transformSystem: getPositionFromMatrix(testEntity)
        },
        after: {
          physicsSystem: getPositionFromMatrix(testEntity),
          physicsPreTransformSystem: new Vector3(0.01666666753590107, 0.03060833364725113, 0.05000000447034836), // getPositionFromMatrix(testEntity),
          transformSystem: new Vector3(0.01666666753590107, 0.03060833364725113, 0.05000000447034836)
        }
      }
      // Sanity check before running
      const result = structuredClone(Expected.before)
      assert.deepEqual(result.physicsSystem, Expected.before.physicsSystem)
      assert.deepEqual(result.physicsPreTransformSystem, Expected.before.physicsPreTransformSystem)
      assert.deepEqual(result.transformSystem, Expected.before.transformSystem)
      // Run and Check the results
      Physics.applyImpulse(physicsWorld, testEntity, testImpulse)
      // .. Phase 1
      const dirtyTransforms = TransformComponent.dirtyTransforms
      execute.physicsSystem()
      result.physicsSystem = getPositionFromMatrix(testEntity)
      assert.deepEqual(result.physicsSystem, Expected.after.physicsSystem)
      // .. Phase 2
      getMutableState(ECSState).simulationTime.set(
        getState(ECSState).simulationTime - getState(ECSState).simulationTimestep
      )
      execute.transformDirtyUpdateSystem()
      execute.physicsPreTransformSystem()
      result.physicsPreTransformSystem = getPositionFromMatrix(testEntity)
      assert.deepEqual(result.physicsPreTransformSystem, Expected.after.physicsPreTransformSystem)
      // .. Phase 3
      execute.transformSystem()
      result.transformSystem = getPositionFromMatrix(testEntity)
      assert.deepEqual(result.transformSystem, Expected.after.transformSystem)
    })
  }) //:: Category 1
}) //:: Integration : PhysicsSystem + PhysicsPreTransformSystem + TransformSystem
