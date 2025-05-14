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

import {
  EntityID,
  EntityTreeComponent,
  EntityUUID,
  SourceID,
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
import { Physics, PhysicsWorld } from '@ir-engine/spatial/src/physics/classes/Physics'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import {
  ColliderComponentDefaults,
  assertColliderComponentEquals
} from '@ir-engine/spatial/src/physics/components/ColliderComponent.test'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups, DefaultCollisionMask } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { assertArray } from '@ir-engine/spatial/tests/util/assert'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import { Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { TriggerCallbackComponent } from './TriggerCallbackComponent'

const TriggerCallbackComponentDefaults = {
  triggers: [] as Array<{
    onEnter: null | string
    onExit: null | string
    target: null | EntityUUID
  }>
}

function assertTriggerCallbackComponentEqual(data, expected) {
  assertArray.eq(data.triggers, expected.triggers)
}

function assertTriggerCallbackComponentNotEqual(data, expected) {
  assertArray.anyNotEq(data.triggers, expected.triggers)
}

describe('TriggerCallbackComponent', () => {
  describe('IDs', () => {
    it('should initialize the TriggerCallbackComponent.name field with the expected value', () => {
      assert.equal(TriggerCallbackComponent.name, 'TriggerCallbackComponent')
    })
    it('should initialize the TriggerCallbackComponent.jsonID field with the expected value', () => {
      assert.equal(TriggerCallbackComponent.jsonID, 'EE_trigger')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TriggerCallbackComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, TriggerCallbackComponent)
      assertTriggerCallbackComponentEqual(data, TriggerCallbackComponentDefaults)
    })
  }) // << onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TriggerCallbackComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized TriggerCallbackComponent', () => {
      const Expected = {
        triggers: [
          {
            onEnter: 'onEnter.Expected',
            onExit: 'onExit.Expected',
            target: 'target' as EntityID
          }
        ]
      }
      const before = getComponent(testEntity, TriggerCallbackComponent)
      assertTriggerCallbackComponentEqual(before, TriggerCallbackComponentDefaults)
      setComponent(testEntity, TriggerCallbackComponent, Expected)

      const data = getComponent(testEntity, TriggerCallbackComponent)
      assertTriggerCallbackComponentEqual(data, Expected)
    })
  }) // << onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      testEntity = createEntity()
      setComponent(testEntity, TriggerCallbackComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should serialize the component's data correctly", () => {
      const json = serializeComponent(testEntity, TriggerCallbackComponent)
      assert.deepEqual(json, TriggerCallbackComponentDefaults)
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
      setComponent(physicsWorldEntity, UUIDComponent, {
        entitySourceID: UUIDComponent.generateUUID() as any as SourceID,
        entityID: UUIDComponent.generateUUID() as any as EntityID
      })
      setComponent(physicsWorldEntity, SceneComponent)
      setComponent(physicsWorldEntity, TransformComponent)
      setComponent(physicsWorldEntity, EntityTreeComponent)
      physicsWorld = Physics.createWorld(physicsWorldEntity)
      physicsWorld!.timestep = 1 / 60

      testEntity = createEntity()
      setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, RigidBodyComponent)
      setComponent(testEntity, ColliderComponent)
      setComponent(testEntity, TriggerCallbackComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should call Physics.setTrigger on the entity's collider when a new ColliderComponent is set", async () => {
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
      await act(() => render(null))
      const collider = physicsWorld.Colliders.get(testEntity)!
      assert.ok(collider)
      assert.ok(collider.isSensor())
    })
  }) // << reactor
})
