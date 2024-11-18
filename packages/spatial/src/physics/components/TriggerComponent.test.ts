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
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeComponent,
  removeEntity,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import { Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertArray } from '../../../tests/util/assert'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Physics, PhysicsWorld } from '../classes/Physics'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { Shapes } from '../types/PhysicsTypes'
import { ColliderComponent } from './ColliderComponent'
import { ColliderComponentDefaults, assertColliderComponentEquals } from './ColliderComponent.test'
import { RigidBodyComponent } from './RigidBodyComponent'
import { TriggerComponent } from './TriggerComponent'

const TriggerComponentDefaults = {
  triggers: [] as Array<{
    onEnter: null | string
    onExit: null | string
    target: null | EntityUUID
  }>
}

function assertTriggerComponentEqual(data, expected) {
  assertArray.eq(data.triggers, expected.triggers)
}

function assertTriggerComponentNotEqual(data, expected) {
  assertArray.anyNotEq(data.triggers, expected.triggers)
}

describe('TriggerComponent', () => {
  describe('IDs', () => {
    it('should initialize the TriggerComponent.name field with the expected value', () => {
      assert.equal(TriggerComponent.name, 'TriggerComponent')
    })
    it('should initialize the TriggerComponent.jsonID field with the expected value', () => {
      assert.equal(TriggerComponent.jsonID, 'EE_trigger')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TriggerComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, TriggerComponent)
      assertTriggerComponentEqual(data, TriggerComponentDefaults)
    })
  }) // << onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TriggerComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized TriggerComponent', () => {
      const Expected = {
        triggers: [
          {
            onEnter: 'onEnter.Expected',
            onExit: 'onExit.Expected',
            target: 'target' as EntityUUID
          }
        ]
      }
      const before = getComponent(testEntity, TriggerComponent)
      assertTriggerComponentEqual(before, TriggerComponentDefaults)
      setComponent(testEntity, TriggerComponent, Expected)

      const data = getComponent(testEntity, TriggerComponent)
      assertTriggerComponentEqual(data, Expected)
    })
  }) // << onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      testEntity = createEntity()
      setComponent(testEntity, TriggerComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should serialize the component's data correctly", () => {
      const json = serializeComponent(testEntity, TriggerComponent)
      assert.deepEqual(json, TriggerComponentDefaults)
    })
  }) // << toJson

  describe('reactor', () => {
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
      physicsWorld!.timestep = 1 / 60

      testEntity = createEntity()
      setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, RigidBodyComponent)
      setComponent(testEntity, ColliderComponent)
      setComponent(testEntity, TriggerComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should call Physics.setTrigger on the entity's collider when a new ColliderComponent is set", () => {
      assertColliderComponentEquals(getComponent(testEntity, ColliderComponent), ColliderComponentDefaults)
      removeComponent(testEntity, ColliderComponent)
      const ColliderComponentData = {
        shape: Shapes.Sphere,
        mass: 3,
        massCenter: new Vector3(1, 2, 3),
        friction: 1.0,
        restitution: 0.1,
        collisionLayer: CollisionGroups.Default,
        collisionMask: DefaultCollisionMask
      }
      setComponent(testEntity, ColliderComponent, ColliderComponentData)
      assertColliderComponentEquals(getComponent(testEntity, ColliderComponent), ColliderComponentData)
      const reactor = ColliderComponent.reactorMap.get(testEntity)!
      assert.ok(reactor.isRunning)
      const collider = physicsWorld.Colliders.get(testEntity)!
      assert.ok(collider)
      assert.ok(collider.isSensor())
    })
  }) // << reactor
})
