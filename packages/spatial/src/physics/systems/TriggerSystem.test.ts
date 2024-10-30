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

import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  EntityUUID,
  SystemDefinitions,
  SystemUUID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { setCallback } from '../../common/CallbackComponent'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Physics, PhysicsWorld } from '../classes/Physics'
import { ColliderComponent } from '../components/ColliderComponent'
import { CollisionComponent } from '../components/CollisionComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { TriggerComponent } from '../components/TriggerComponent'
import { ColliderHitEvent, CollisionEvents } from '../types/PhysicsTypes'
import { TriggerSystem, triggerEnterOrExit } from './TriggerSystem'

describe('TriggerSystem', () => {
  describe('IDs', () => {
    it("should define the TriggerSystem's UUID with the expected value", () => {
      assert.equal(TriggerSystem, 'ee.engine.TriggerSystem' as SystemUUID)
    })
  })

  const InvalidEntityUUID = 'dummyID-123456' as EntityUUID

  /** @todo Refactor: Simplify by using sinon.spy functions */
  const EnterStartValue = 42 // Start testOnEnter at 42
  let enterVal = EnterStartValue
  const TestOnEnterName = 'test.onEnter'
  function testOnEnter(ent1, ent2) {
    ++enterVal
  }

  /** @todo Refactor: Simplify by using sinon.spy functions */
  const ExitStartValue = 10_042 // Start testOnExit at 10_042
  let exitVal = ExitStartValue
  const TestOnExitName = 'test.onExit'
  function testOnExit(ent1, ent2) {
    ++exitVal
  }

  let triggerEntity = UndefinedEntity
  let targetEntity = UndefinedEntity
  let testEntity = UndefinedEntity
  let targetEntityUUID = '' as EntityUUID
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
    physicsWorld.timestep = 1 / 60

    // Create the entity
    testEntity = createEntity()
    setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
    setComponent(testEntity, TransformComponent)
    setComponent(testEntity, RigidBodyComponent)
    setComponent(testEntity, ColliderComponent)

    targetEntity = createEntity()
    setComponent(targetEntity, UUIDComponent, UUIDComponent.generateUUID())
    setCallback(targetEntity, TestOnEnterName, testOnEnter)
    setCallback(targetEntity, TestOnExitName, testOnExit)
    targetEntityUUID = getComponent(targetEntity, UUIDComponent)

    triggerEntity = createEntity()
    setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
    setComponent(triggerEntity, TransformComponent)
    setComponent(triggerEntity, RigidBodyComponent)
    setComponent(triggerEntity, ColliderComponent)
    setComponent(triggerEntity, TriggerComponent, {
      triggers: [{ onEnter: TestOnEnterName, onExit: TestOnExitName, target: targetEntityUUID }]
    })
  })

  afterEach(() => {
    removeEntity(testEntity)
    removeEntity(triggerEntity)
    removeEntity(targetEntity)
    return destroyEngine()
  })

  describe('triggerEnter', () => {
    const Hit = { type: CollisionEvents.TRIGGER_START } as ColliderHitEvent // @todo The hitEvent argument is currently ignored in the function body
    describe('for all entity.triggerComponent.triggers ...', () => {
      it('... should only run if trigger.target defines the UUID of a valid entity', () => {
        setComponent(triggerEntity, TriggerComponent, {
          triggers: [{ onEnter: TestOnEnterName, onExit: TestOnExitName, target: InvalidEntityUUID }]
        })
        assert.equal(enterVal, EnterStartValue)
        triggerEnterOrExit(triggerEntity, targetEntity, Hit)
        assert.equal(enterVal, EnterStartValue)
      })

      it('... should only run if trigger.onEnter callback has a value and is part of the target.CallbackComponent.callbacks map', () => {
        const noEnterEntity = createEntity()
        setComponent(noEnterEntity, UUIDComponent, UUIDComponent.generateUUID())
        setCallback(noEnterEntity, TestOnExitName, testOnExit)
        const noEnterEntityUUID = getComponent(noEnterEntity, UUIDComponent)
        setComponent(triggerEntity, TriggerComponent, {
          triggers: [{ onEnter: null, onExit: TestOnExitName, target: noEnterEntityUUID }]
        })
        assert.equal(enterVal, EnterStartValue)
        triggerEnterOrExit(triggerEntity, targetEntity, Hit)
        assert.equal(enterVal, EnterStartValue)
      })

      it('... should run the target.CallbackComponent.callbacks[trigger.onEnter] function', () => {
        assert.equal(enterVal, EnterStartValue)
        triggerEnterOrExit(triggerEntity, targetEntity, Hit)
        assert.notEqual(enterVal, EnterStartValue)
      })
    })
  })

  describe('triggerExit', () => {
    const Hit = { type: CollisionEvents.TRIGGER_END } as ColliderHitEvent // @todo The hitEvent argument is currently ignored in the function body
    describe('for all entity.triggerComponent.triggers ...', () => {
      it('... should only run if trigger.target defines the UUID of a valid entity', () => {
        setComponent(triggerEntity, TriggerComponent, {
          triggers: [{ onEnter: TestOnEnterName, onExit: TestOnExitName, target: InvalidEntityUUID }]
        })
        assert.equal(exitVal, ExitStartValue)
        triggerEnterOrExit(triggerEntity, targetEntity, Hit)
        assert.equal(exitVal, ExitStartValue)
      })

      it('... should only run if trigger.onExit callback has a value and is part of the target.CallbackComponent.callbacks map', () => {
        const noExitEntity = createEntity()
        setComponent(noExitEntity, UUIDComponent, UUIDComponent.generateUUID())
        setCallback(noExitEntity, TestOnExitName, testOnExit)
        const noExitEntityUUID = getComponent(noExitEntity, UUIDComponent)
        setComponent(triggerEntity, TriggerComponent, {
          triggers: [{ onEnter: TestOnEnterName, onExit: null, target: noExitEntityUUID }]
        })
        assert.equal(exitVal, ExitStartValue)
        triggerEnterOrExit(triggerEntity, targetEntity, Hit)
        assert.equal(exitVal, ExitStartValue)
      })

      it('... should run the target.CallbackComponent.callbacks[trigger.onExit] function', () => {
        assert.equal(exitVal, ExitStartValue)
        triggerEnterOrExit(triggerEntity, targetEntity, Hit)
        assert.notEqual(exitVal, ExitStartValue)
      })
    })
  })

  describe('execute', () => {
    const triggerSystemExecute = SystemDefinitions.get(TriggerSystem)!.execute

    it('should only run for entities that have both a TriggerComponent and a CollisionComponent  (aka. collisionQuery)', () => {
      const triggerTestStartHit = {
        type: CollisionEvents.TRIGGER_START,
        bodySelf: physicsWorld.Rigidbodies.get(triggerEntity)!,
        bodyOther: physicsWorld.Rigidbodies.get(testEntity)!,
        shapeSelf: physicsWorld.Colliders.get(triggerEntity)!,
        shapeOther: physicsWorld.Colliders.get(testEntity)!,
        maxForceDirection: null,
        totalForce: null
      } as ColliderHitEvent

      removeComponent(triggerEntity, TriggerComponent)
      setComponent(triggerEntity, CollisionComponent)
      const collision = getComponent(triggerEntity, CollisionComponent)
      collision?.set(testEntity, triggerTestStartHit)

      const beforeEnter = EnterStartValue + 1 // +1 because the system runs once before this test
      const beforeExit = ExitStartValue + 1
      assert.equal(enterVal, beforeEnter)
      assert.equal(exitVal, beforeExit)
      console.log(enterVal, exitVal)
      triggerSystemExecute()
      assert.equal(enterVal, beforeEnter)
      assert.equal(exitVal, beforeExit)
    })

    it('should run `triggerEnter` for all entities that match the collisionQuery and have a CollisionComponent', () => {
      const triggerTestStartHit = {
        type: CollisionEvents.TRIGGER_START,
        bodySelf: physicsWorld.Rigidbodies.get(triggerEntity)!,
        bodyOther: physicsWorld.Rigidbodies.get(testEntity)!,
        shapeSelf: physicsWorld.Colliders.get(triggerEntity)!,
        shapeOther: physicsWorld.Colliders.get(testEntity)!,
        maxForceDirection: null,
        totalForce: null
      } as ColliderHitEvent

      const beforeEnter = EnterStartValue + 1 // +1 because the system runs once before this test
      assert.equal(enterVal, beforeEnter)
      // Set a start collision and run the system
      assert.ok(!hasComponent(triggerEntity, CollisionComponent))
      setComponent(triggerEntity, CollisionComponent)
      const collision = getComponent(triggerEntity, CollisionComponent)
      collision?.set(testEntity, triggerTestStartHit)
      triggerSystemExecute()
      // Check after
      assert.notEqual(enterVal, beforeEnter)
    })

    it('should run `triggerExit` for all entities that match the collisionQuery and have a CollisionComponent', () => {
      const triggerTestEndHit = {
        type: CollisionEvents.TRIGGER_END,
        bodySelf: physicsWorld.Rigidbodies.get(triggerEntity)!,
        bodyOther: physicsWorld.Rigidbodies.get(testEntity)!,
        shapeSelf: physicsWorld.Colliders.get(triggerEntity)!,
        shapeOther: physicsWorld.Colliders.get(testEntity)!,
        maxForceDirection: null,
        totalForce: null
      } as ColliderHitEvent

      const beforeExit = ExitStartValue + 1 // +1 because the system runs once before this test
      assert.equal(exitVal, beforeExit)
      // Set an end collision and run the system
      assert.ok(!hasComponent(triggerEntity, CollisionComponent))
      setComponent(triggerEntity, CollisionComponent)
      const collision = getComponent(triggerEntity, CollisionComponent)
      collision?.set(testEntity, triggerTestEndHit)
      triggerSystemExecute()
      // Check after
      assert.notEqual(exitVal, beforeExit)
    })
  })
})
