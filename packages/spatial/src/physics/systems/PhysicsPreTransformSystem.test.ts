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
  Entity,
  SystemDefinitions,
  SystemUUID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertVec } from '../../../tests/util/assert'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import { EntityTreeComponent, iterateEntityNode } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { TransformDirtyUpdateSystem, isDirty } from '../../transform/systems/TransformSystem'
import { Physics, PhysicsWorld } from '../classes/Physics'
import { ColliderComponent } from '../components/ColliderComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { BodyTypes } from '../types/PhysicsTypes'
import { PhysicsPreTransformFunctions, PhysicsPreTransformSystem } from './PhysicsPreTransformSystem'

const _rotation = new Quaternion()
const _position = new Vector3()
const _scale = new Vector3()

describe('PhysicsPreTransformFunctions', () => {
  function assertDirty(entity: Entity, id: number = 0): void {
    if (!id) {
      assert.equal(TransformComponent.dirtyTransforms[entity], false)
      return
    }
    assert.equal(TransformComponent.dirtyTransforms[entity], true)
  }

  function assertNotDirty(entity: Entity, id: number = 0): void {
    if (!id) {
      assert.equal(TransformComponent.dirtyTransforms[entity], false)
      return
    }
    if (TransformComponent.dirtyTransforms[entity] === undefined) return
    assert.equal(TransformComponent.dirtyTransforms[entity], false)
  }

  describe('lerpTransformFromRigidbody', () => {
    const Start = {
      position: new Vector3(1, 2, 3),
      rotation: new Quaternion(0.5, 0.3, 0.2, 0.0).normalize()
    }
    const Final = {
      position: new Vector3(4, 5, 6),
      rotation: new Quaternion(0.0, 0.2, 0.8, 0.0).normalize()
    }
    const Alpha = 0.5

    describe('when the entity has a RigidBodyComponent ...', () => {
      let testEntity = UndefinedEntity
      let physicsWorldEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorldEntity = createEntity()
        setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(physicsWorldEntity, EntityTreeComponent)
        setComponent(physicsWorldEntity, TransformComponent)
        setComponent(physicsWorldEntity, SceneComponent)
        physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))

        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
        // Set the Start..Final values for interpolation
        const body = getComponent(testEntity, RigidBodyComponent)
        body.previousPosition.set(Start.position.x, Start.position.y, Start.position.z)
        body.previousRotation.set(Start.rotation.x, Start.rotation.y, Start.rotation.z, Start.rotation.w)
        body.position.set(Final.position.x, Final.position.y, Final.position.z)
        body.rotation.set(Final.rotation.x, Final.rotation.y, Final.rotation.z, Final.rotation.w)
      })

      afterEach(() => {
        removeEntity(testEntity)
        removeEntity(physicsWorldEntity)
        return destroyEngine()
      })

      it("should update the entity's TransformComponent.position with an interpolation of the RigidBodyComponent.previousPosition and the RigidBodyComponent.position", () => {
        const Expected = new Vector3(2.5, 3.5, 4.5)
        const Initial = new Vector3(0, 0, 0)
        // Sanity check before running
        assert.equal(hasComponent(testEntity, TransformComponent), true)
        assert.equal(hasComponent(testEntity, RigidBodyComponent), true)
        const before = getComponent(testEntity, TransformComponent).position
        assertVec.approxEq(before, Initial, 3)
        // Run and Check the result
        PhysicsPreTransformFunctions.lerpTransformFromRigidbody(testEntity, Alpha)
        getComponent(testEntity, TransformComponent).matrix.decompose(_position, _rotation, _scale)
        const result = _position
        assertVec.allApproxNotEq(result, Initial, 3)
        assertVec.approxEq(result, Expected, 3)
      })

      it("should update the entity's TransformComponent.rotation with an interpolation of the RigidBodyComponent.previousRotation and the RigidBodyComponent.rotation", () => {
        const Expected = new Quaternion(
          0.05976796731237829,
          -0.05501084265150082,
          -0.006351678252007763,
          0.9966047156416791
        ).normalize()
        const Initial = new Quaternion()
        // Sanity check before running
        assert.equal(hasComponent(testEntity, TransformComponent), true)
        assert.equal(hasComponent(testEntity, RigidBodyComponent), true)
        const before = getComponent(testEntity, TransformComponent).rotation
        assertVec.approxEq(before, Initial, 3)
        // Run and Check the result
        PhysicsPreTransformFunctions.lerpTransformFromRigidbody(testEntity, Alpha)
        getComponent(testEntity, TransformComponent).matrix.decompose(_position, _rotation, _scale)
        const result = _rotation
        assertVec.allApproxNotEq(result, Initial, 4)
        assertVec.approxEq(result, Expected, 4)
      })
    })

    describe('other cases ...', () => {
      let testEntity = UndefinedEntity
      let physicsWorldEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorldEntity = createEntity()
        setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(physicsWorldEntity, EntityTreeComponent)
        setComponent(physicsWorldEntity, TransformComponent)
        setComponent(physicsWorldEntity, SceneComponent)
        physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))

        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
        // Set the Start..Final values for interpolation
        const body = getComponent(testEntity, RigidBodyComponent)
        body.previousPosition.set(Start.position.x, Start.position.y, Start.position.z)
        body.previousRotation.set(Start.rotation.x, Start.rotation.y, Start.rotation.z, Start.rotation.w)
        body.position.set(Final.position.x, Final.position.y, Final.position.z)
        body.rotation.set(Final.rotation.x, Final.rotation.y, Final.rotation.z, Final.rotation.w)
      })

      afterEach(() => {
        removeEntity(testEntity)
        removeEntity(physicsWorldEntity)
        return destroyEngine()
      })

      it('should not set the `@param entity` transform to dirty', () => {
        // Sanity check before running
        assertNotDirty(testEntity)
        // Run and Check the result
        PhysicsPreTransformFunctions.lerpTransformFromRigidbody(testEntity, Alpha)
        assertNotDirty(testEntity)
      })

      it('should deeply set all children transforms to dirty', () => {
        // Sanity check before running
        assertNotDirty(testEntity)
        // Run and Check the result
        PhysicsPreTransformFunctions.lerpTransformFromRigidbody(testEntity, Alpha)
        iterateEntityNode(testEntity, assertDirty)
      })
    })
  }) //:: lerpTransformFromRigidbody

  describe('copyTransformToRigidBody', () => {
    describe('when there is a physics world ...', () => {
      let testEntity = UndefinedEntity
      let physicsWorldEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorldEntity = createEntity()
        setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(physicsWorldEntity, EntityTreeComponent)
        setComponent(physicsWorldEntity, TransformComponent)
        setComponent(physicsWorldEntity, SceneComponent)
        physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))

        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(physicsWorldEntity)
        removeEntity(testEntity)
        return destroyEngine()
      })

      it("should update the position of the entity's RigidBody inside the physicsWorld data and the RigidBodyComponent of the entity, based on its TransformComponent data", () => {
        // Set the data as expected
        setComponent(testEntity, TransformComponent, { position: new Vector3(40, 41, 42) })
        // Sanity check before running
        const before = {
          body: physicsWorld.Rigidbodies.get(testEntity)!,
          previousPosition: getComponent(testEntity, RigidBodyComponent).previousPosition,
          position: getComponent(testEntity, TransformComponent).position
        }
        assertVec.allApproxNotEq(before.previousPosition, before.position, 3)
        assertVec.allApproxNotEq(before.body.translation(), before.position, 3)
        // Run and Check the result
        PhysicsPreTransformFunctions.copyTransformToRigidBody(testEntity)
        const after = {
          body: physicsWorld.Rigidbodies.get(testEntity)!,
          previousPosition: getComponent(testEntity, RigidBodyComponent).previousPosition,
          position: getComponent(testEntity, TransformComponent).position
        }
        assertVec.approxEq(after.previousPosition, after.position, 3)
        assertVec.approxEq(after.body.translation(), after.position, 3)
      })

      it("should update the rotation of the entity's RigidBody inside the physicsWorld data and the RigidBodyComponent of the entity, based on its TransformComponent data", () => {
        // Set the data as expected
        setComponent(testEntity, TransformComponent, { rotation: new Quaternion(40, 41, 42).normalize() })
        // Sanity check before running
        const before = {
          body: physicsWorld.Rigidbodies.get(testEntity)!,
          previousRotation: getComponent(testEntity, RigidBodyComponent).previousRotation,
          rotation: getComponent(testEntity, TransformComponent).rotation
        }
        assertVec.allApproxNotEq(before.previousRotation, before.rotation, 4)
        assertVec.allApproxNotEq(before.body.rotation(), before.rotation, 4)
        // Run and Check the result
        PhysicsPreTransformFunctions.copyTransformToRigidBody(testEntity)
        const after = {
          body: physicsWorld.Rigidbodies.get(testEntity)!,
          previousRotation: getComponent(testEntity, RigidBodyComponent).previousRotation,
          rotation: getComponent(testEntity, TransformComponent).rotation
        }
        assertVec.approxEq(after.previousRotation, after.rotation, 4)
        assertVec.approxEq(after.body.rotation(), after.rotation, 4)
      })

      it('should not set the `@param entity` transform to dirty', () => {
        // Sanity check before running
        assertNotDirty(testEntity)
        // Run and Check the result
        PhysicsPreTransformFunctions.copyTransformToRigidBody(testEntity)
        assertNotDirty(testEntity)
      })

      it('should deeply set all children transforms to dirty', () => {
        // Sanity check before running
        assertNotDirty(testEntity)
        // Run and Check the result
        PhysicsPreTransformFunctions.copyTransformToRigidBody(testEntity)
        iterateEntityNode(testEntity, assertDirty)
      })
    })

    describe('when there is no physics world ...', () => {
      let testEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should not do anything', () => {
        // Sanity check before running
        assertDirty(testEntity, 1)
        // Run and Check the result
        PhysicsPreTransformFunctions.copyTransformToRigidBody(testEntity)
        assertDirty(testEntity, 1)
      })
    })
  }) //:: copyTransformToRigidBody

  describe('copyTransformToCollider', () => {
    describe('when there is a physics world ...', () => {
      let testEntity = UndefinedEntity
      let rigidbodyEntity = UndefinedEntity
      let physicsWorldEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorldEntity = createEntity()
        setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(physicsWorldEntity, EntityTreeComponent)
        setComponent(physicsWorldEntity, TransformComponent)
        setComponent(physicsWorldEntity, SceneComponent)
        physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))

        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
        rigidbodyEntity = createEntity()
        setComponent(rigidbodyEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
        setComponent(rigidbodyEntity, TransformComponent)
        setComponent(rigidbodyEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(rigidbodyEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(physicsWorldEntity)
        removeEntity(testEntity)
        return destroyEngine()
      })

      it("should remove the previous collider from the world, create a new one from the rigidbodyEntity's data, and attach it to the world", () => {
        const Initial = { x: 40, y: 41, z: 42 }
        // Set the data as expected
        const colliderDesc = Physics.createColliderDesc(physicsWorld, testEntity, rigidbodyEntity)
        Physics.attachCollider(physicsWorld!, colliderDesc, rigidbodyEntity, testEntity)!
        physicsWorld.Colliders.get(testEntity)?.setTranslation(Initial)
        const before = {
          x: physicsWorld.Colliders.get(testEntity)?.translation().x,
          y: physicsWorld.Colliders.get(testEntity)?.translation().y,
          z: physicsWorld.Colliders.get(testEntity)?.translation().z
        }
        assertVec.approxEq(before, Initial, 3)
        // Run and Check the result
        PhysicsPreTransformFunctions.copyTransformToCollider(testEntity)
        const result = {
          x: physicsWorld.Colliders.get(testEntity)?.translation().x,
          y: physicsWorld.Colliders.get(testEntity)?.translation().y,
          z: physicsWorld.Colliders.get(testEntity)?.translation().z
        }
        assertVec.allApproxNotEq(result, before, 3)
      })
    })

    describe('when there is no physics world ...', () => {
      let testEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should not do anything', () => {
        // Sanity check before running
        assertDirty(testEntity, 1)
        // Run and Check the result
        PhysicsPreTransformFunctions.copyTransformToCollider(testEntity)
        assertDirty(testEntity, 1)
      })
    })
  }) //:: copyTransformToCollider

  describe('filterAwakeCleanRigidbodies', () => {
    describe('when there is no physics world ...', () => {
      let testEntity = UndefinedEntity
      let physicsWorldEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        physicsWorldEntity = createEntity()
        setComponent(physicsWorldEntity, EntityTreeComponent)
        setComponent(physicsWorldEntity, TransformComponent)
        TransformComponent.dirtyTransforms[physicsWorldEntity] = false // We would hit a different branch otherwise

        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      })

      afterEach(() => {
        removeEntity(physicsWorldEntity)
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should return false', () => {
        const Expected = false
        // Run and Check the result
        const result = PhysicsPreTransformFunctions.filterAwakeCleanRigidbodies(testEntity)
        assert.equal(result, Expected)
      })
    })

    describe('when there is a physics world ...', () => {
      let testEntity = UndefinedEntity
      let rigidbodyEntity = UndefinedEntity
      let physicsWorldEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorldEntity = createEntity()
        setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(physicsWorldEntity, EntityTreeComponent)
        setComponent(physicsWorldEntity, TransformComponent)
        setComponent(physicsWorldEntity, SceneComponent)
        physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))

        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
        rigidbodyEntity = createEntity()
        setComponent(rigidbodyEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
        setComponent(rigidbodyEntity, TransformComponent)
        setComponent(rigidbodyEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(rigidbodyEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(physicsWorldEntity)
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should return true if the entity has a parent with a dirty transform', () => {
        const Expected = true
        // Sanity check before running
        assert.equal(TransformComponent.dirtyTransforms[physicsWorldEntity], true)
        // Run and Check the result
        const result = PhysicsPreTransformFunctions.filterAwakeCleanRigidbodies(testEntity)
        assert.equal(result, Expected)
      })

      it('should return false if the entity has a dirty transform', () => {
        const Expected = false
        // Set the data as expected
        TransformComponent.dirtyTransforms[physicsWorldEntity] = false
        TransformComponent.dirtyTransforms[testEntity] = true
        // Sanity check before running
        assert.equal(TransformComponent.dirtyTransforms[physicsWorldEntity], false)
        assert.equal(isDirty(testEntity), true)
        // Run and Check the result
        const result = PhysicsPreTransformFunctions.filterAwakeCleanRigidbodies(testEntity)
        assert.equal(result, Expected)
      })

      it('should return false if the entity is sleeping', () => {
        const Expected = false
        // Set the data as expected
        TransformComponent.dirtyTransforms[physicsWorldEntity] = false
        TransformComponent.dirtyTransforms[testEntity] = false
        physicsWorld.Rigidbodies.get(testEntity)?.sleep()
        // Sanity check before running
        assert.equal(TransformComponent.dirtyTransforms[physicsWorldEntity], false)
        assert.equal(isDirty(testEntity), false)
        // Run and Check the result
        const result = PhysicsPreTransformFunctions.filterAwakeCleanRigidbodies(testEntity)
        assert.equal(result, Expected)
      })

      it('should return true if the entity is not sleeping', () => {
        const Expected = true
        // Set the data as expected
        TransformComponent.dirtyTransforms[physicsWorldEntity] = false
        TransformComponent.dirtyTransforms[testEntity] = false
        // physicsWorld.Rigidbodies.get(testEntity)?.sleep()
        // Sanity check before running
        assert.equal(TransformComponent.dirtyTransforms[physicsWorldEntity], false)
        assert.equal(isDirty(testEntity), false)
        // Run and Check the result
        const result = PhysicsPreTransformFunctions.filterAwakeCleanRigidbodies(testEntity)
        assert.equal(result, Expected)
      })
    })
  }) //:: filterAwakeCleanRigidbodies
}) //:: PhysicsPreTransformFunctions

describe('PhysicsPreTransformSystem', () => {
  describe('Fields', () => {
    const SystemDecl = PhysicsPreTransformSystem
    const System = SystemDefinitions.get(SystemDecl)

    it('should initialize the System.uuid field with the expected value', () => {
      const Expected = 'ee.engine.PhysicsPreTransformSystem'
      assert.equal(SystemDecl, Expected as SystemUUID)
      assert.equal(System!.uuid, Expected)
    })

    it('should initialize the System.insert field with the expected value', () => {
      assert.notEqual(System!.insert, undefined)
      assert.notEqual(System!.insert!.after, undefined)
      assert.equal(System!.insert!.after!, TransformDirtyUpdateSystem)
    })
  }) //:: Fields

  // describe('execute', () => {}) //:: execute
}) //:: PhysicsPreTransformSystem
