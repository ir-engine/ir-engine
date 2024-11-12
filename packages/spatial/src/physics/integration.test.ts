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
  getMutableComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { BoxGeometry, MathUtils, Mesh, Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertVecAnyApproxNotEq, assertVecApproxEq } from '../../tests/util/mathAssertions'
import { NameComponent } from '../common/NameComponent'
import { Axis, Vector3_Zero } from '../common/constants/MathConstants'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { SceneComponent } from '../renderer/components/SceneComponents'
import { VisibleComponent } from '../renderer/components/VisibleComponent'
import { EntityTreeComponent } from '../transform/components/EntityTree'
import { TransformComponent } from '../transform/components/TransformComponent'
import {
  TransformDirtyCleanupSystem,
  TransformDirtyUpdateSystem,
  TransformSystem,
  computeTransformMatrix
} from '../transform/systems/TransformSystem'
import { PhysicsPreTransformSystem, PhysicsSystem } from './PhysicsModule'
import { Physics, PhysicsWorld } from './classes/Physics'
import { ColliderComponent } from './components/ColliderComponent'
import { RigidBodyComponent } from './components/RigidBodyComponent'
import { BodyTypes, Shapes } from './types/PhysicsTypes'

// import '../transform/TransformModule'
// import './PhysicsModule'

const execute = {
  physicsSystem: SystemDefinitions.get(PhysicsSystem)!.execute, // with: SimulationSystemGroup
  transformDirtyUpdateSystem: SystemDefinitions.get(TransformDirtyUpdateSystem)!.execute, // before: TransformSystem
  physicsPreTransformSystem: SystemDefinitions.get(PhysicsPreTransformSystem)!.execute, // after: TransformDirtyUpdateSystem -> before: TransformSystem
  transformSystem: SystemDefinitions.get(TransformSystem)!.execute, // after: AnimationSystemGroup
  transformDirtyCleanupSystem: SystemDefinitions.get(TransformDirtyCleanupSystem)!.execute // after: TransformSystem
}

/**
 * @description
 * Runs the Transform systems so that entities have their TransformComponent data properly updated. */
function updateTransforms(): void {
  execute.transformDirtyUpdateSystem()
  execute.transformSystem()
  execute.transformDirtyCleanupSystem()
}

/**
 * @description
 * Creates a new {@link Vector3} object that contains a copy of the position components of the `@param entity`'s {@link TransformComponent}.matrix */
function getPositionFromMatrix(entity: Entity): Vector3 {
  const result: Vector3 = new Vector3()
  getComponent(entity, TransformComponent).matrix.decompose(result, new Quaternion(), new Vector3())
  return result
}

/**
 * @description
 * Creates a new {@link Vector3} object that contains a copy of the position components of the `@param entity`'s {@link TransformComponent}.matrixWorld */
function getPositionFromMatrixWorld(entity: Entity): Vector3 {
  const result: Vector3 = new Vector3()
  getComponent(entity, TransformComponent).matrixWorld.decompose(result, new Quaternion(), new Vector3())
  return result
}

/**
 * @description
 * Creates a new {@link Quaternion} object that contains a copy of the rotation components of the `@param entity`'s {@link TransformComponent}.matrixWorld */
function getRotationFromMatrixWorld(entity: Entity): Quaternion {
  const result: Quaternion = new Quaternion()
  getComponent(entity, TransformComponent).matrixWorld.decompose(new Vector3(), result, new Vector3())
  return result
}

/**
 * @description
 * Creates a new {@link Vector3} object that contains a copy of the scale components of the `@param entity`'s {@link TransformComponent}.matrixWorld */
function getScaleFromMatrixWorld(entity: Entity): Vector3 {
  const result: Vector3 = new Vector3()
  getComponent(entity, TransformComponent).matrixWorld.decompose(new Vector3(), new Quaternion(), result)
  return result
}

const GravityOneFrame = new Vector3(0, 0.002723, 0)

describe('Integration : PhysicsSystem + PhysicsPreTransformSystem + TransformSystem', () => {
  describe('Physics Driven Transformations', () => {
    let testEntity = UndefinedEntity
    let physicsWorldEntity = UndefinedEntity
    let physicsWorld: PhysicsWorld

    beforeEach(async () => {
      createEngine()
      // mockSpatialEngine()
      await Physics.load()
      physicsWorldEntity = createEntity()
      setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
      setComponent(physicsWorldEntity, EntityTreeComponent)
      setComponent(physicsWorldEntity, SceneComponent)
      setComponent(physicsWorldEntity, TransformComponent)
      physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
      physicsWorld.timestep = 1 / 60

      testEntity = createEntity()
      updateTransforms()
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

    it("should commit pose modifications generated by the Physics into the entity's TransformComponent data", () => {
      const testImpulse = new Vector3(1, 2, 3)
      // Set the data as expected
      setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(testEntity, VisibleComponent)
      setComponent(testEntity, TransformComponent)
      const mesh = new Mesh(new BoxGeometry())
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
          physicsPreTransformSystem: new Vector3(0.01666666753590107, 0.03060833364725113, 0.05000000447034836),
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
  }) //:: Physics Driven Transformations

  describe('Transform Overrides (aka teleportation)', () => {
    let testEntity = UndefinedEntity
    let parentEntity = UndefinedEntity
    let physicsWorldEntity = UndefinedEntity
    let physicsWorld: PhysicsWorld

    const childrenCount = 4
    let children: Entity[] = []
    const Initial = {
      position: new Vector3(21, 22, 23),
      rotation: new Quaternion(1, 2, 3, 4).normalize(),
      scale: new Vector3(4, 5, 6)
    }

    const setupEntityTree = () => {
      // .. Set a parent
      setComponent(parentEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(parentEntity, NameComponent, 'parentEntity')
      setComponent(parentEntity, TransformComponent)
      // .. Set a child
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      setComponent(testEntity, NameComponent, 'testEntity')
      // .. Set a rigidbody on the child
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })

      for (let id = 0; id < childrenCount; ++id) {
        children.push(createEntity())
        let entity = children[id]
        setComponent(entity, NameComponent, 'childEntity-' + id)
        setComponent(entity, EntityTreeComponent, { parentEntity: id === 0 ? testEntity : children[id - 1] })
        setComponent(entity, TransformComponent)
        // .. Set the collider on the child first subchild
        if (id === 0) setComponent(entity, ColliderComponent, { shape: Shapes.Sphere })
      }
      updateTransforms()
    }

    const removeChidren = () => {
      for (let id = 0; id < childrenCount; ++id) removeEntity(children[id])
      children = []
    }

    beforeEach(async () => {
      createEngine()
      // mockSpatialEngine()
      await Physics.load()
      physicsWorldEntity = createEntity()
      setComponent(physicsWorldEntity, NameComponent, 'physicsWorldEntity')
      setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
      setComponent(physicsWorldEntity, EntityTreeComponent)
      setComponent(physicsWorldEntity, SceneComponent)
      setComponent(physicsWorldEntity, TransformComponent)
      physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
      physicsWorld.timestep = 1 / 60

      testEntity = createEntity()
      parentEntity = createEntity()
      updateTransforms()
    })

    afterEach(() => {
      removeChidren()
      removeEntity(testEntity)
      removeEntity(parentEntity)
      removeEntity(physicsWorldEntity)
      return destroyEngine()
    })

    it('should move the RigidBody+Collider of an entity relative to its parent', () => {
      const ChangeAmount = 42
      const Initial = new Vector3(42, 43, 44)
      const Expected = Initial.clone().addScalar(ChangeAmount)
      // Set the data as expected
      // .. Set a parent
      setComponent(parentEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(parentEntity, TransformComponent, { position: Initial })
      // .. Set a child
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      // .. Set a collider+rigidbody on the child
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
      // Sanity check before running
      updateTransforms()
      const before = getPositionFromMatrixWorld(testEntity)
      assertVecAnyApproxNotEq(before, Expected, 3)

      // Run and Check the results
      // .. Phase 0: Move the child
      getMutableComponent(testEntity, TransformComponent).position.value.addScalar(ChangeAmount)
      // .. Phase 1
      execute.physicsSystem()
      // .. Phase 2
      getMutableState(ECSState).simulationTime.set(
        getState(ECSState).simulationTime - getState(ECSState).simulationTimestep
      )
      execute.transformDirtyUpdateSystem()
      execute.physicsPreTransformSystem()
      // .. Phase 3
      execute.transformSystem()

      const result = {
        entity: getPositionFromMatrixWorld(testEntity),
        rigidBody: physicsWorld.Rigidbodies.get(testEntity)?.translation(),
        collider: physicsWorld.Colliders.get(testEntity)?.translation()
      }
      assertVecAnyApproxNotEq(before, result.entity, 3) // Check that the entity moved
      assertVecApproxEq(result.entity, Expected, 3) // Check that the entity moved relative to its parent
      assertVecApproxEq(result.rigidBody, Expected, 3) // Check that the rigidbody was also moved to the correct position
      assertVecApproxEq(result.collider, Expected, 3) // Check that the collider was also moved to the correct position
    })

    it('should allow moving the RigidBody of an entity separately from its Transform, and the movement should be relative to its parent', () => {
      const ChangeAmount = 42
      const Initial = new Vector3(42, 43, 44)
      const Expected = Initial.clone().sub(GravityOneFrame)
      // Set the data as expected
      // .. Set a parent
      setComponent(parentEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(parentEntity, TransformComponent, { position: Initial })
      // .. Set a child
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      // .. Set a collider+rigidbody on the child
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
      // Sanity check before running
      updateTransforms()
      const before = getComponent(testEntity, RigidBodyComponent).position.clone()
      assertVecAnyApproxNotEq(before, Expected, 3)
      before.sub(GravityOneFrame)

      // Run and Check the results
      getMutableComponent(testEntity, RigidBodyComponent).position.value.addScalar(ChangeAmount)
      // .. Phase 1
      execute.physicsSystem()
      // .. Phase 2
      getMutableState(ECSState).simulationTime.set(
        getState(ECSState).simulationTime - getState(ECSState).simulationTimestep
      )
      execute.transformDirtyUpdateSystem()
      execute.physicsPreTransformSystem()
      // .. Phase 3
      execute.transformSystem()

      const result = {
        entity: getPositionFromMatrixWorld(testEntity),
        rigidBody: physicsWorld.Rigidbodies.get(testEntity)?.translation(),
        collider: physicsWorld.Colliders.get(testEntity)?.translation()
      }
      assertVecApproxEq(before, result.entity, 3) // Check that the entity did not move
      assertVecApproxEq(before, result.collider, 3) // Check that the Collider did not move
      assertVecAnyApproxNotEq(result.entity, result.rigidBody, 3) // Check that the RigidBody moved separately from the Transform
      assertVecApproxEq(result.rigidBody, Expected, 3) // Check that the RigidBody moved to the correct position
    })

    describe('should apply parent.transform overrides to all the child entities contained in its EntityTree ...', () => {
      it('... position', () => {
        const ChangeAmount = 42
        const Expected = Initial.position.clone().addScalar(ChangeAmount)
        // Set the data as expected
        setupEntityTree()
        const transform = setComponent(parentEntity, TransformComponent, { position: Initial.position })
        updateTransforms()
        // Sanity check before running
        for (let id = 0; id < childrenCount; ++id) assert.equal(hasComponent(children[id], TransformComponent), true)

        // Run and Check the results
        getMutableComponent(testEntity, TransformComponent).position.value.addScalar(ChangeAmount)
        // .. Phase 1
        execute.physicsSystem()
        // .. Phase 2
        getMutableState(ECSState).simulationTime.set(
          getState(ECSState).simulationTime - getState(ECSState).simulationTimestep
        )
        execute.transformDirtyUpdateSystem()
        execute.physicsPreTransformSystem()
        // .. Phase 3
        execute.transformSystem()

        for (let id = 0; id < childrenCount; ++id) {
          const entity = children[id]
          const result = getPositionFromMatrixWorld(entity)
          // Should change each sub child of the parent, no matter its depth
          assertVecApproxEq(result, Expected, 3)
          // Should also change the Collider of the Child that has it
          if (hasComponent(entity, ColliderComponent))
            assertVecApproxEq(physicsWorld.Colliders.get(entity)?.translation(), Expected, 3)
        }
        removeChidren()
      })

      it('... rotation', () => {
        const ChangeAmount = MathUtils.degToRad(90)
        const Expected = Initial.rotation.clone().setFromAxisAngle(Axis.Y, ChangeAmount)
        // Set the data as expected
        setupEntityTree()
        setComponent(parentEntity, TransformComponent, { position: Initial.position })
        updateTransforms()
        // Sanity check before running
        for (let id = 0; id < childrenCount; ++id) assert.equal(hasComponent(children[id], TransformComponent), true)

        // Run and Check the results
        getMutableComponent(testEntity, TransformComponent).rotation.value.setFromAxisAngle(Axis.Y, ChangeAmount)
        // .. Phase 1
        execute.physicsSystem()
        // .. Phase 2
        getMutableState(ECSState).simulationTime.set(
          getState(ECSState).simulationTime - getState(ECSState).simulationTimestep
        )
        execute.transformDirtyUpdateSystem()
        execute.physicsPreTransformSystem()
        // .. Phase 3
        execute.transformSystem()

        for (let id = 0; id < childrenCount; ++id) {
          const entity = children[id]
          const result = getRotationFromMatrixWorld(entity)
          // Should change each sub child of the parent, no matter its depth
          assertVecApproxEq(result, Expected, 4)
          // Should also change the Collider of the Child that has it
          if (hasComponent(entity, ColliderComponent))
            assertVecApproxEq(physicsWorld.Colliders.get(entity)?.rotation(), Expected, 4)
        }
        removeChidren()
      })

      it('... scale', () => {
        const ChangeAmount = 42
        const Expected = Initial.scale.clone().addScalar(ChangeAmount)
        // Set the data as expected
        setupEntityTree()
        setComponent(parentEntity, TransformComponent, { position: Initial.position })
        updateTransforms()
        // Sanity check before running
        for (let id = 0; id < childrenCount; ++id) assert.equal(hasComponent(children[id], TransformComponent), true)

        // Run and Check the results
        getMutableComponent(testEntity, TransformComponent).scale.set(Initial.scale)
        getMutableComponent(testEntity, TransformComponent).scale.value.addScalar(ChangeAmount)
        // .. Phase 1
        execute.physicsSystem()
        // .. Phase 2
        getMutableState(ECSState).simulationTime.set(
          getState(ECSState).simulationTime - getState(ECSState).simulationTimestep
        )
        execute.transformDirtyUpdateSystem()
        execute.physicsPreTransformSystem()
        // .. Phase 3
        execute.transformSystem()

        for (let id = 0; id < childrenCount; ++id) {
          const entity = children[id]
          const result = getScaleFromMatrixWorld(entity)
          // Should change each sub child of the parent, no matter its depth
          assertVecApproxEq(result, Expected, 3)
        }
        removeChidren()
      })
    })

    describe("should apply scene.transform modifications to all entities contained in the scene's hierarchy", () => {
      it('... position', () => {
        const ChangeAmount = 42
        const Expected = Initial.position.clone().addScalar(ChangeAmount)
        // Set the data as expected
        setupEntityTree()
        setComponent(physicsWorldEntity, TransformComponent, { position: Initial.position })
        updateTransforms()
        // Sanity check before running
        for (let id = 0; id < childrenCount; ++id) assert.equal(hasComponent(children[id], TransformComponent), true)

        // Run and Check the results
        // .. Phase 0
        getComponent(physicsWorldEntity, TransformComponent).position.addScalar(ChangeAmount)
        {
          /** @todo This is a BUG. See TransformComponent.getMatrixRelativeToScene */
          computeTransformMatrix(physicsWorldEntity)
          computeTransformMatrix(parentEntity)
        }
        // .. Phase 1
        execute.physicsSystem()
        // .. Phase 2
        getMutableState(ECSState).simulationTime.set(
          getState(ECSState).simulationTime - getState(ECSState).simulationTimestep
        )
        execute.transformDirtyUpdateSystem()
        execute.physicsPreTransformSystem()
        // .. Phase 3
        execute.transformSystem()

        for (let id = 0; id < childrenCount; ++id) {
          const entity = children[id]
          const result = getPositionFromMatrixWorld(entity)
          // Should change each sub child of the parent, no matter its depth
          assertVecApproxEq(result, Expected, 3)
        }
        removeChidren()
      })

      it('... rotation', () => {
        const ChangeAmount = MathUtils.degToRad(90)
        const Expected = Initial.rotation.clone().setFromAxisAngle(Axis.Y, ChangeAmount)
        // Set the data as expected
        setupEntityTree()
        setComponent(physicsWorldEntity, TransformComponent, { rotation: Initial.rotation })
        updateTransforms()
        // Sanity check before running
        for (let id = 0; id < childrenCount; ++id) assert.equal(hasComponent(children[id], TransformComponent), true)

        // Run and Check the results
        // .. Phase 0
        getMutableComponent(physicsWorldEntity, TransformComponent).rotation.value.setFromAxisAngle(
          Axis.Y,
          ChangeAmount
        )
        {
          /** @todo This is a BUG. See TransformComponent.getMatrixRelativeToScene */
          computeTransformMatrix(physicsWorldEntity)
          computeTransformMatrix(parentEntity)
        }
        // .. Phase 1
        execute.physicsSystem()
        // .. Phase 2
        getMutableState(ECSState).simulationTime.set(
          getState(ECSState).simulationTime - getState(ECSState).simulationTimestep
        )
        execute.transformDirtyUpdateSystem()
        execute.physicsPreTransformSystem()
        // .. Phase 3
        execute.transformSystem()

        for (let id = 0; id < childrenCount; ++id) {
          const entity = children[id]
          const result = getRotationFromMatrixWorld(entity)
          // Should change each sub child of the parent, no matter its depth
          assertVecApproxEq(result, Expected, 4)
        }
        removeChidren()
      })

      it('... scale', () => {
        const ChangeAmount = 42
        const Expected = Initial.scale.clone().addScalar(ChangeAmount)
        // Set the data as expected
        setupEntityTree()
        setComponent(physicsWorldEntity, TransformComponent, { scale: Initial.scale })
        updateTransforms()
        // Sanity check before running
        for (let id = 0; id < childrenCount; ++id) assert.equal(hasComponent(children[id], TransformComponent), true)

        // Run and Check the results
        // .. Phase 0
        getMutableComponent(physicsWorldEntity, TransformComponent).scale.value.addScalar(ChangeAmount)
        {
          /** @todo This is a BUG. See TransformComponent.getMatrixRelativeToScene */
          computeTransformMatrix(physicsWorldEntity)
          computeTransformMatrix(parentEntity)
        }
        // .. Phase 1
        execute.physicsSystem()
        // .. Phase 2
        getMutableState(ECSState).simulationTime.set(
          getState(ECSState).simulationTime - getState(ECSState).simulationTimestep
        )
        execute.transformDirtyUpdateSystem()
        execute.physicsPreTransformSystem()
        // .. Phase 3
        execute.transformSystem()

        for (let id = 0; id < childrenCount; ++id) {
          const entity = children[id]
          const result = getScaleFromMatrixWorld(entity)
          // Should change each sub child of the parent, no matter its depth
          assertVecApproxEq(result, Expected, 3)
        }
        removeChidren()
      })
    })

    it('should allow moving the Collider of a child entity separately when the collider is set into a different entity and the Transform of that entity moves. Its movement should be relative to its parent', () => {
      const ChangeAmount = 42
      const Expected = Initial.position.clone().addScalar(ChangeAmount).sub(GravityOneFrame)
      // Set the data as expected
      setupEntityTree()
      setComponent(physicsWorldEntity, TransformComponent, { position: Initial.position })
      updateTransforms()
      // Sanity check before running
      for (let id = 0; id < childrenCount; ++id) assert.equal(hasComponent(children[id], TransformComponent), true)

      // Run the processes
      // .. Phase 0
      const colliderChildEntity = children.find((entity: Entity) => hasComponent(entity, ColliderComponent))!
      getComponent(colliderChildEntity, TransformComponent).position.addScalar(ChangeAmount)
      {
        /** @todo This is a BUG. See TransformComponent.getMatrixRelativeToScene */
        computeTransformMatrix(physicsWorldEntity)
        computeTransformMatrix(parentEntity)
      }
      // .. Phase 1
      execute.physicsSystem()
      // .. Phase 2
      getMutableState(ECSState).simulationTime.set(
        getState(ECSState).simulationTime - getState(ECSState).simulationTimestep
      )
      execute.transformDirtyUpdateSystem()
      execute.physicsPreTransformSystem()
      // .. Phase 3
      execute.transformSystem()

      // Check the result
      // .. Should change the Collider transform inside the physics world data
      const physicsPosition = physicsWorld.Colliders.get(colliderChildEntity)?.translation()
      const transformPosition = getPositionFromMatrix(colliderChildEntity).sub(GravityOneFrame)
      const transformPositionWorld = getPositionFromMatrixWorld(colliderChildEntity)
      assert.notEqual(physicsPosition, undefined)
      assertVecAnyApproxNotEq(transformPosition, Vector3_Zero, 3)
      assertVecApproxEq(physicsPosition, transformPosition, 3)
      assertVecApproxEq(transformPositionWorld, Expected, 3)

      // Cleanup after we are done
      removeChidren()
    })
  }) //:: Transform Overrides (aka teleportation)
}) //:: Integration : PhysicsSystem + PhysicsPreTransformSystem + TransformSystem
