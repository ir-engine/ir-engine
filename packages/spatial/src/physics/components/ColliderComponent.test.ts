/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'

import {
  Entity,
  UndefinedEntity,
  createEntity,
  destroyEngine,
  getComponent,
  removeComponent,
  removeEntity,
  serializeComponent,
  setComponent
} from '@etherealengine/ecs'
import { getMutableState } from '@etherealengine/hyperflux'

import { World } from '@dimforge/rapier3d-compat'
import { Vector3 } from 'three'
import { TransformComponent } from '../../SpatialModule'
import { createEngine } from '../../initializeEngine'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { Physics } from '../classes/Physics'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { PhysicsState } from '../state/PhysicsState'
import { BodyTypes, Shapes } from '../types/PhysicsTypes'
import { ColliderComponent } from './ColliderComponent'
import { RigidBodyComponent } from './RigidBodyComponent'
import { TriggerComponent } from './TriggerComponent'

export const ColliderComponentDefaults = {
  // also used in TriggerComponent.test.ts
  shape: Shapes.Box,
  mass: 1,
  massCenter: new Vector3(),
  friction: 0.5,
  restitution: 0.5,
  collisionLayer: CollisionGroups.Default,
  collisionMask: DefaultCollisionMask
}

export function assertColliderComponentEquals(data, expected) {
  // also used in TriggerComponent.test.ts
  assert.equal(data.shape, expected.shape)
  assert.equal(data.mass, expected.mass)
  assert.deepEqual(data.massCenter, expected.massCenter)
  assert.equal(data.friction, expected.friction)
  assert.equal(data.restitution, expected.restitution)
  assert.equal(data.collisionLayer, expected.collisionLayer)
  assert.equal(data.collisionMask, expected.collisionMask)
}

describe('ColliderComponent', () => {
  describe('general functionality', () => {
    let entity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
      entity = createEntity()
    })

    afterEach(() => {
      removeEntity(entity)
      return destroyEngine()
    })

    it('should add collider to rigidbody', () => {
      setComponent(entity, TransformComponent)
      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(entity, ColliderComponent)

      const body = Physics._Rigidbodies.get(entity)!
      const collider = Physics._Colliders.get(entity)!

      assert.equal(body.numColliders(), 1)
      assert(collider)
      assert.equal(collider, body.collider(0))
    })

    it('should remove collider from rigidbody', () => {
      setComponent(entity, TransformComponent)
      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(entity, ColliderComponent)

      const body = Physics._Rigidbodies.get(entity)!
      const collider = Physics._Colliders.get(entity)!

      assert.equal(body.numColliders(), 1)
      assert(collider)
      assert.equal(collider, body.collider(0))

      removeComponent(entity, ColliderComponent)

      assert.equal(body.numColliders(), 0)
    })

    it('should add trigger collider', () => {
      setComponent(entity, TransformComponent)

      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(entity, TriggerComponent)
      setComponent(entity, ColliderComponent)

      const collider = Physics._Colliders.get(entity)!
      assert.equal(collider!.isSensor(), true)
    })
  })

  describe('IDs', () => {
    it('should initialize the ColliderComponent.name field with the expected value', () => {
      assert.equal(ColliderComponent.name, 'ColliderComponent')
    })
    it('should initialize the ColliderComponent.jsonID field with the expected value', () => {
      assert.equal(ColliderComponent.jsonID, 'EE_collider')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, ColliderComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, ColliderComponent)
      assertColliderComponentEquals(data, ColliderComponentDefaults)
    })
  }) // << onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, ColliderComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized ColliderComponent', () => {
      const Expected = {
        shape: Shapes.Sphere,
        mass: 2,
        massCenter: new Vector3(1, 2, 3),
        friction: 4.0,
        restitution: 5.0,
        collisionLayer: CollisionGroups.Ground,
        collisionMask: CollisionGroups.Avatars | CollisionGroups.Trigger
      }
      const before = getComponent(testEntity, ColliderComponent)
      assertColliderComponentEquals(before, ColliderComponentDefaults)
      setComponent(testEntity, ColliderComponent, Expected)

      const data = getComponent(testEntity, ColliderComponent)
      assertColliderComponentEquals(data, Expected)
    })

    it('should not change values of an initialized ColliderComponent when the data passed had incorrect types', () => {
      const Incorrect = {
        shape: 1,
        mass: 'mass.incorrect',
        massCenter: 2,
        friction: 'friction.incorrect',
        restitution: 'restitution.incorrect',
        collisionLayer: 'collisionLayer.incorrect',
        collisionMask: 'trigger.incorrect'
      }
      const before = getComponent(testEntity, ColliderComponent)
      assertColliderComponentEquals(before, ColliderComponentDefaults)

      // @ts-ignore
      setComponent(testEntity, ColliderComponent, Incorrect)
      const data = getComponent(testEntity, ColliderComponent)
      assertColliderComponentEquals(data, ColliderComponentDefaults)
    })
  }) // << onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      testEntity = createEntity()
      setComponent(testEntity, ColliderComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should serialize the component's data correctly", () => {
      const json = serializeComponent(testEntity, ColliderComponent)
      assert.deepEqual(json, ColliderComponentDefaults)
    })
  }) // << toJson

  describe('reactor', () => {
    let testEntity = UndefinedEntity
    let parentEntity = UndefinedEntity
    let physicsWorld: World | undefined = undefined

    function createValidAncestor(colliderData = ColliderComponentDefaults): Entity {
      const result = createEntity()
      setComponent(result, TransformComponent)
      setComponent(result, ColliderComponent, colliderData)
      setComponent(result, RigidBodyComponent)
      return result
    }

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      physicsWorld = Physics.createWorld()
      physicsWorld!.timestep = 1 / 60
      getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)

      parentEntity = createValidAncestor()
      testEntity = createEntity()
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, ColliderComponent)
      setComponent(testEntity, RigidBodyComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      physicsWorld = undefined
      return destroyEngine()
    })

    /**
    // @todo After the other tests fails are fixed
    describe("should attach a collider to the physicsWorld based on the entity and its closest ancestor with a RigidBodyComponent ...", () => {
      it("... when the shape of the entity's collider changes", () => {
        assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      })
      it("... when the scale of the entity's collider changes", () => {
        assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      })
      it("... when the closest ancestor to the entity, with a RigidBodyComponent, changes", () => {
        assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      })
    })

    // @todo Why is this failing?
    it("should set the mass of the API data based on the component.mass.value when it changes", () => {
      assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      const Expected = 42
      const before = Physics._Colliders.get(testEntity)!.mass()
      getMutableComponent(testEntity, ColliderComponent).mass.set(Expected)
      const after = Physics._Colliders.get(testEntity)!.mass()
      assert.notEqual(before, after, "Before and After should not be equal")
      assert.notEqual(before, Expected, "Before and Expected should not be equal")
      assert.equal(after, Expected, "After and Expected should be equal")
    })

    // @todo Why is this failing?
    it("should set the friction of the API data based on the component.friction.value when it changes", () => {
      assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      const Expected = 42
      const before = Physics._Colliders.get(testEntity)!.friction()
      getMutableComponent(testEntity, ColliderComponent).friction.set(Expected)
      const after = Physics._Colliders.get(testEntity)!.friction()
      assert.notEqual(before, after, "Before and After should not be equal")
      assert.notEqual(before, Expected, "Before and Expected should not be equal")
      assert.equal(after, Expected, "After and Expected should be equal")
    })

    // @todo Why is this failing?
    it("should set the restitution of the API data based on the component.restitution.value when it changes", () => {
      assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      const Expected = 42
      const before = Physics._Colliders.get(testEntity)!.restitution()
      getMutableComponent(testEntity, ColliderComponent).restitution.set(Expected)
      const after = Physics._Colliders.get(testEntity)!.restitution()
      assert.notEqual(before, after, "Before and After should not be equal")
      assert.notEqual(before, Expected, "Before and Expected should not be equal")
      assert.equal(after, Expected, "After and Expected should be equal")
    })

    // @todo After the above issues are solved
    it("should set the collisionLayer of the API data based on the component.collisionLayer.value when it changes", () => {
      assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      const collider = Physics._Colliders.get(testEntity)
    })

    // @todo After the above issues are solved
    it("should set the collisionMask of the API data based on the component.collisionMask.value when it changes", () => {
      assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      const collider = Physics._Colliders.get(testEntity)
    })
    */
  }) // << reactor
})
