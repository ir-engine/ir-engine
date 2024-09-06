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

import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import {
  Entity,
  SimulationSystemGroup,
  SystemDefinitions,
  SystemUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { getState, startReactor } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import assert from 'assert'
import { Vector3 } from 'three'
import { TransformComponent } from '../../SpatialModule'
import { Vector3_Zero } from '../../common/constants/MathConstants'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { PhysicsSerialization } from '../PhysicsSerialization'
import { Physics, PhysicsWorld } from '../classes/Physics'
import { assertVecAllApproxNotEq, assertVecAnyApproxNotEq, assertVecApproxEq } from '../classes/Physics.test'
import { ColliderComponent } from '../components/ColliderComponent'
import { CollisionComponent } from '../components/CollisionComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { BodyTypes } from '../types/PhysicsTypes'
import { PhysicsSystem } from './PhysicsSystem'

/** @description Number of steps per second that the physics will run */
const steps = 60

describe('PhysicsSystem', () => {
  describe('Fields', () => {
    const System = SystemDefinitions.get(PhysicsSystem)

    it("should define the System's UUID with the expected value", () => {
      const Expected = 'ee.engine.PhysicsSystem'
      assert.equal(PhysicsSystem, Expected as SystemUUID)
      assert.equal(System!.uuid, Expected)
    })

    it('should initialize the InputExecutionSystemGroup.insert field with the expected value', () => {
      assert.notEqual(System!.insert, undefined)
      assert.notEqual(System!.insert!.with, undefined)
      assert.equal(System!.insert!.with!, SimulationSystemGroup)
    })
  }) //:: Fields

  describe('execute', () => {
    let testEntity = UndefinedEntity
    let physicsWorld: PhysicsWorld
    let physicsWorldEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      physicsWorldEntity = createEntity()
      setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
      setComponent(physicsWorldEntity, SceneComponent)
      setComponent(physicsWorldEntity, TransformComponent)
      setComponent(physicsWorldEntity, EntityTreeComponent)
      physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
      physicsWorld.timestep = 1 / steps

      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    const physicsSystemExecute = SystemDefinitions.get(PhysicsSystem)!.execute

    it('should step the physics', () => {
      // Setup the data as expected
      setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      setComponent(testEntity, ColliderComponent)
      const testImpulse = new Vector3(1, 2, 3)
      // Sanity check before running
      const beforeBody = physicsWorld.Rigidbodies.get(testEntity)
      assert.ok(beforeBody)
      const before = beforeBody.linvel()
      assertVecApproxEq(before, Vector3_Zero, 3)
      // Run and Check after
      Physics.applyImpulse(physicsWorld, testEntity, testImpulse)
      physicsSystemExecute()
      const afterBody = physicsWorld.Rigidbodies.get(testEntity)
      assert.ok(afterBody)
      const after = afterBody.linvel()
      assertVecAllApproxNotEq(after, before, 3)
    })

    function cloneRigidBodyPoseData(entity: Entity) {
      const body = getComponent(testEntity, RigidBodyComponent)
      return {
        previousPosition: body.previousPosition.clone(),
        previousRotation: body.previousRotation.clone(),
        position: body.position.clone(),
        rotation: body.rotation.clone(),
        targetKinematicPosition: body.targetKinematicPosition.clone(),
        targetKinematicRotation: body.targetKinematicRotation.clone(),
        linearVelocity: body.linearVelocity.clone(),
        angularVelocity: body.angularVelocity.clone()
      }
    }

    it('should update poses on the ECS', () => {
      // Setup the data as expected
      setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      setComponent(testEntity, ColliderComponent)
      const testImpulse = new Vector3(1, 2, 3)
      // Sanity check before running
      const before = cloneRigidBodyPoseData(testEntity)
      const body = getComponent(testEntity, RigidBodyComponent)
      assertVecApproxEq(before.previousPosition, body.previousPosition.clone(), 3)
      assertVecApproxEq(before.previousRotation, body.previousRotation.clone(), 3)
      assertVecApproxEq(before.position, body.position.clone(), 3)
      assertVecApproxEq(before.rotation, body.rotation.clone(), 4)
      assertVecApproxEq(before.targetKinematicPosition, body.targetKinematicPosition.clone(), 3)
      assertVecApproxEq(before.targetKinematicRotation, body.targetKinematicRotation.clone(), 4)
      assertVecApproxEq(before.linearVelocity, body.linearVelocity.clone(), 3)
      assertVecApproxEq(before.angularVelocity, body.angularVelocity.clone(), 3)

      // Run and Check after
      Physics.applyImpulse(physicsWorld, testEntity, testImpulse)
      physicsSystemExecute()
      const after = cloneRigidBodyPoseData(testEntity)
      assertVecAnyApproxNotEq(after.previousPosition, before.previousPosition, 3)
      assertVecAnyApproxNotEq(after.previousRotation, before.previousRotation, 3)
      assertVecAnyApproxNotEq(after.position, before.position, 3)
      assertVecAnyApproxNotEq(after.rotation, before.rotation, 4)
      assertVecAnyApproxNotEq(after.targetKinematicPosition, before.targetKinematicPosition, 3)
      assertVecAnyApproxNotEq(after.targetKinematicRotation, before.targetKinematicRotation, 4)
      assertVecAnyApproxNotEq(after.linearVelocity, before.linearVelocity, 3)
      assertVecAnyApproxNotEq(after.angularVelocity, before.angularVelocity, 3)
    })

    it('should call Physics.simulate to update collisions on the ECS', () => {
      const entity1 = createEntity()
      setComponent(entity1, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(entity1, TransformComponent)
      setComponent(entity1, RigidBodyComponent, { type: BodyTypes.Dynamic })
      setComponent(entity1, ColliderComponent, { mass: 1 })
      const entity2 = createEntity()
      setComponent(entity2, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(entity2, TransformComponent) // Will check for overlapping collision
      setComponent(entity2, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(entity2, ColliderComponent)
      // Sanity check before
      assert.equal(hasComponent(entity1, CollisionComponent), false)
      assert.equal(hasComponent(entity2, CollisionComponent), false)

      // Run and Check after
      physicsSystemExecute()
      assert.equal(hasComponent(entity1, CollisionComponent), true)
      assert.equal(hasComponent(entity2, CollisionComponent), true)
    })

    it('should remove the CollisionComponents when there are no longer any entities colliding', () => {
      const entity1 = createEntity()
      setComponent(entity1, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(entity1, TransformComponent)
      setComponent(entity1, RigidBodyComponent, { type: BodyTypes.Dynamic })
      setComponent(entity1, ColliderComponent, { mass: 1 })
      const entity2 = createEntity()
      setComponent(entity2, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(entity2, TransformComponent) // Will check for overlapping collision
      setComponent(entity2, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(entity2, ColliderComponent)
      // Sanity check before
      assert.equal(hasComponent(entity1, CollisionComponent), false)
      assert.equal(hasComponent(entity2, CollisionComponent), false)
      physicsSystemExecute()
      assert.equal(hasComponent(entity1, CollisionComponent), true)
      assert.equal(hasComponent(entity2, CollisionComponent), true)

      // Run and Check after
      const NoCollisionStepID = 10 // @note entity1's body will move out of range from entity2 in 10 steps (due to gravity)
      for (let id = 0; id < steps; ++id) {
        physicsSystemExecute()
        if (id < NoCollisionStepID) {
          assert.equal(hasComponent(entity1, CollisionComponent), true)
          assert.equal(hasComponent(entity2, CollisionComponent), true)
        } else {
          assert.equal(hasComponent(entity1, CollisionComponent), false)
          assert.equal(hasComponent(entity2, CollisionComponent), false)
        }
      }
    })
  }) //:: execute

  describe('reactor', () => {
    describe('mount/unmount', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld
      let physicsWorldEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorldEntity = createEntity()
        setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(physicsWorldEntity, SceneComponent)
        setComponent(physicsWorldEntity, TransformComponent)
        setComponent(physicsWorldEntity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
        physicsWorld.timestep = 1 / steps

        testEntity = createEntity()
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      const physicsSystemReactor = SystemDefinitions.get(PhysicsSystem)!.reactor!

      it('should set NetworkState.networkSchema[PhysicsSerialization.ID] when it mounts', () => {
        const before = getState(NetworkState).networkSchema[PhysicsSerialization.ID]
        assert.equal(before, undefined)
        // Run and Check the result
        const root = startReactor(physicsSystemReactor)
        const after = getState(NetworkState).networkSchema[PhysicsSerialization.ID]
        assert.notEqual(after, undefined)
      })

      it('should set NetworkState.networkSchema[PhysicsSerialization.ID] to none when it unmounts', () => {
        const before = getState(NetworkState).networkSchema[PhysicsSerialization.ID]
        assert.equal(before, undefined)
        // Run and Check the result
        const root = startReactor(physicsSystemReactor)
        const after = getState(NetworkState).networkSchema[PhysicsSerialization.ID]
        assert.notEqual(after, undefined)
        root.stop()
        const result = getState(NetworkState).networkSchema[PhysicsSerialization.ID]
        assert.equal(result, undefined)
      })
    }) //:: mount/unmount

    describe('PhysicsSceneReactor', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld
      let physicsWorldEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        // await Physics.load()
        physicsWorldEntity = createEntity()
        setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(physicsWorldEntity, EntityTreeComponent)
        setComponent(physicsWorldEntity, TransformComponent)

        testEntity = createEntity()
      })

      afterEach(() => {
        removeEntity(physicsWorldEntity)
        removeEntity(testEntity)
        return destroyEngine()
      })

      const physicsSystemReactor = SystemDefinitions.get(PhysicsSystem)?.reactor

      it.skip("should create a new physics world whenever the UUIDComponent of a SceneComponent's entityContext changes", () => {
        // Sanity check before running
        assert.equal(hasComponent(physicsWorldEntity, SceneComponent), false)
        assert.throws(() => Physics.destroyWorld(getComponent(physicsWorldEntity, UUIDComponent)))
        // Run and Check the result
        const root = startReactor(physicsSystemReactor!)
        setComponent(physicsWorldEntity, SceneComponent)
        root.run()
        assert.equal(hasComponent(physicsWorldEntity, SceneComponent), true)
        assert.doesNotThrow(() => Physics.destroyWorld(getComponent(physicsWorldEntity, UUIDComponent)))
      })
    }) //:: PhysicsSceneReactor
  }) //:: reactor
}) //:: PhysicsSystem
