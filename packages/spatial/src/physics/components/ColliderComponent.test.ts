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
import { startEngine } from '@etherealengine/ecs/src/Engine'
import { Vector3 } from 'three'
import { TransformComponent } from '../../SpatialModule'
import { EntityTreeComponent, getAncestorWithComponent } from '../../transform/components/EntityTree'
import { Physics } from '../classes/Physics'
import { assertVecAllApproxNotEq, assertVecApproxEq } from '../classes/Physics.test'
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

export function assertColliderComponentEquals(data, expected, testShape = true) {
  // also used in TriggerComponent.test.ts
  testShape && assert.equal(data.shape.type, expected.shape.type)
  assert.equal(data.mass, expected.mass)
  assert.deepEqual(data.massCenter, expected.massCenter)
  assert.equal(data.friction, expected.friction)
  assert.equal(data.restitution, expected.restitution)
  assert.equal(data.collisionLayer, expected.collisionLayer)
  assert.equal(data.collisionMask, expected.collisionMask)
}

function getLayerFromCollisionGroups(groups: number): number {
  return (groups & 0xffff_0000) >> 16
}
function getMaskFromCollisionGroups(groups: number): number {
  return groups & 0x0000_ffff
}

describe('ColliderComponent', () => {
  describe('general functionality', () => {
    let entity = UndefinedEntity

    beforeEach(async () => {
      startEngine()
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
      startEngine()
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
      startEngine()
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
      startEngine()
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

    function createValidAncestor(colliderData = ColliderComponentDefaults as any): Entity {
      const result = createEntity()
      setComponent(result, TransformComponent)
      setComponent(result, ColliderComponent, colliderData)
      setComponent(result, RigidBodyComponent)
      return result
    }

    beforeEach(async () => {
      startEngine()
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

    describe('should attach and/or remove a collider to the physicsWorld based on the entity and its closest ancestor with a RigidBodyComponent ...', () => {
      it("... when the shape of the entity's collider changes", () => {
        assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
        const beforeCollider = Physics._Colliders.get(testEntity)
        assert.ok(beforeCollider)
        const before = beforeCollider.shape
        assert.equal(getComponent(testEntity, ColliderComponent).shape, ColliderComponentDefaults.shape)

        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
        assert.notEqual(getComponent(testEntity, ColliderComponent).shape, ColliderComponentDefaults.shape)
        const after1Collider = Physics._Colliders.get(testEntity)!
        const after1 = after1Collider.shape
        assert.notEqual(beforeCollider.handle, after1Collider.handle)
        assert.notDeepEqual(after1, before)

        removeComponent(testEntity, ColliderComponent)
        assert.notEqual(getComponent(testEntity, ColliderComponent)?.shape, ColliderComponentDefaults.shape)
        const after2Collider = Physics._Colliders.get(testEntity)!
        assert.equal(after2Collider, undefined)
      })

      it("... when the scale of the entity's transform changes", () => {
        assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
        const TransformScaleDefault = new Vector3(1, 1, 1)
        const Expected = new Vector3(42, 42, 42)
        const beforeCollider = Physics._Colliders.get(testEntity)
        assert.ok(beforeCollider)
        const before = getComponent(testEntity, TransformComponent).scale.clone()
        assertVecApproxEq(before, TransformScaleDefault, 3)

        // Apply and check on changes
        setComponent(testEntity, TransformComponent, { scale: Expected })
        const after1 = getComponent(testEntity, TransformComponent).scale.clone()
        assertVecAllApproxNotEq(before, after1, 3)

        // Apply and check on component removal
        removeComponent(testEntity, ColliderComponent)
        const after2 = getComponent(testEntity, TransformComponent).scale.clone()
        assert.notEqual(after1, after2)
        const afterCollider = Physics._Colliders.get(testEntity)
        assert.equal(afterCollider, undefined)
      })

      it('... when the closest ancestor to the entity, with a RigidBodyComponent, changes', () => {
        assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
        const newParent = createValidAncestor()
        assert.notEqual(parentEntity, newParent)

        removeComponent(testEntity, EntityTreeComponent)
        setComponent(testEntity, EntityTreeComponent, { parentEntity: newParent })
        const ancestor = getAncestorWithComponent(
          testEntity,
          RigidBodyComponent,
          /*closest*/ true,
          /*includeSelf*/ false
        )
        assert.equal(ancestor, newParent)
      })
    })

    it('should set the mass of the API data based on the component.mass.value when it changes', () => {
      assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      const Expected = 42
      const before = Physics._Colliders.get(testEntity)!.mass()
      setComponent(testEntity, ColliderComponent, { mass: Expected })
      const after = Physics._Colliders.get(testEntity)!.mass()
      assert.notEqual(before, after, 'Before and After should not be equal')
      assert.notEqual(before, Expected, 'Before and Expected should not be equal')
      assert.equal(after, Expected, 'After and Expected should be equal')
    })

    it('should set the friction of the API data based on the component.friction.value when it changes', () => {
      assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      const Expected = 42
      const before = Physics._Colliders.get(testEntity)!.friction()
      setComponent(testEntity, ColliderComponent, { friction: Expected })
      const after = Physics._Colliders.get(testEntity)!.friction()
      assert.notEqual(before, after, 'Before and After should not be equal')
      assert.notEqual(before, Expected, 'Before and Expected should not be equal')
      assert.equal(after, Expected, 'After and Expected should be equal')
    })

    it('should set the restitution of the API data based on the component.restitution.value when it changes', () => {
      assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      const Expected = 42
      const before = Physics._Colliders.get(testEntity)!.restitution()
      setComponent(testEntity, ColliderComponent, { restitution: Expected })
      const after = Physics._Colliders.get(testEntity)!.restitution()
      assert.notEqual(before, after, 'Before and After should not be equal')
      assert.notEqual(before, Expected, 'Before and Expected should not be equal')
      assert.equal(after, Expected, 'After and Expected should be equal')
    })

    it('should set the collisionLayer of the API data based on the component.collisionLayer.value when it changes', () => {
      assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      const Expected = CollisionGroups.Avatars
      const before = getLayerFromCollisionGroups(Physics._Colliders.get(testEntity)!.collisionGroups())
      setComponent(testEntity, ColliderComponent, { collisionLayer: Expected })
      const after = getLayerFromCollisionGroups(Physics._Colliders.get(testEntity)!.collisionGroups())
      assert.notEqual(before, after, 'Before and After should not be equal')
      assert.notEqual(before, Expected, 'Before and Expected should not be equal')
      assert.equal(after, Expected, 'After and Expected should be equal')
    })

    it('should set the collisionMask of the API data based on the component.collisionMask.value when it changes', () => {
      assert.ok(ColliderComponent.reactorMap.get(testEntity)!.isRunning)
      const Expected = CollisionGroups.Avatars
      const before = getMaskFromCollisionGroups(Physics._Colliders.get(testEntity)!.collisionGroups())
      setComponent(testEntity, ColliderComponent, { collisionMask: Expected })
      const after = getMaskFromCollisionGroups(Physics._Colliders.get(testEntity)!.collisionGroups())
      assert.notEqual(before, after, 'Before and After should not be equal')
      assert.notEqual(before, Expected, 'Before and Expected should not be equal')
      assert.equal(after, Expected, 'After and Expected should be equal')
    })
  }) // << reactor
})
