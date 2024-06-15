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

import { World } from '@dimforge/rapier3d-compat'
import {
  EntityUUID,
  SystemUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { getMutableState } from '@etherealengine/hyperflux'
import { TransformComponent } from '../../SpatialModule'
import { setCallback } from '../../common/CallbackComponent'
import { createEngine } from '../../initializeEngine'
import { Physics } from '../classes/Physics'
import { ColliderComponent } from '../components/ColliderComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { TriggerComponent } from '../components/TriggerComponent'
import { PhysicsState } from '../state/PhysicsState'
import { ColliderHitEvent } from '../types/PhysicsTypes'
import { TriggerSystem } from './TriggerSystem'

describe('TriggerSystem', () => {
  describe('IDs', () => {
    it("should define the TriggerSystem's UUID with the expected value", () => {
      assert.equal(TriggerSystem, 'ee.engine.TriggerSystem' as SystemUUID)
    })
  })

  const EnterStartValue = 42 // Start testOnEnter at 42
  let enterVal = EnterStartValue
  const TestOnEnterName = 'test.onEnter'
  function testOnEnter() {
    ++enterVal
  }

  const ExitStartValue = 10_042 // Start testOnExit at 10_042
  let exitVal = ExitStartValue
  const TestOnExitName = 'test.onEnter'
  function testOnExit() {
    ++exitVal
  }

  let triggerEntity = UndefinedEntity
  let testEntity = UndefinedEntity
  let testEntityUUID = '' as EntityUUID
  let physicsWorld: World | undefined = undefined

  beforeEach(async () => {
    createEngine()
    await Physics.load()
    physicsWorld = Physics.createWorld()
    getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
    physicsWorld!.timestep = 1 / 60

    // Create the entity
    testEntity = createEntity()
    setComponent(testEntity, TransformComponent)
    setComponent(testEntity, RigidBodyComponent)
    setComponent(testEntity, ColliderComponent)
    testEntityUUID = getComponent(testEntity, UUIDComponent)

    triggerEntity = createEntity()
    setComponent(triggerEntity, TransformComponent)
    setComponent(triggerEntity, RigidBodyComponent)
    setComponent(triggerEntity, ColliderComponent)
    setCallback(triggerEntity, TestOnEnterName, testOnEnter)
    setCallback(triggerEntity, TestOnExitName, testOnExit)
    setComponent(triggerEntity, TriggerComponent, {
      triggers: [{ onEnter: TestOnEnterName, onExit: TestOnExitName, target: testEntityUUID }]
    })
  })

  afterEach(() => {
    removeEntity(testEntity)
    physicsWorld = undefined
    return destroyEngine()
  })

  describe('triggerEnter', () => {
    const Hit = {} as ColliderHitEvent // @todo The hitEvent argument is currently ignored in the function body
    describe('for all entity.triggerComponent.triggers ...', () => {
      // it("... should only run if trigger.target defines the UUID of a valid entity", () => {})
      // it("... should only run if trigger.onEnter callback has a value and is part of the target.CallbackComponent.callbacks map", () => {})
      /**
      // @todo Why is this failing?
      // Test setup is probably incorrect
      it('... should run the target.CallbackComponent.callbacks[trigger.onEnter] function', () => {
        assert.equal(enterVal, EnterStartValue)
        triggerEnter(triggerEntity, testEntity, Hit)
        assert.notEqual(enterVal, EnterStartValue)
      })
      */
    })
  })

  describe('triggerExit', () => {
    const Hit = {} as ColliderHitEvent // @todo The hitEvent argument is currently ignored in the function body
    describe('for all entity.triggerComponent.triggers ...', () => {
      // it("... should only run if trigger.target defines the UUID of a valid entity", () => {})
      // it("... should only run if trigger.onExit callback has a value and is part of the target.CallbackComponent.callbacks map", () => {})
      /**
      // @todo Why is this failing?
      it('... should run the target.CallbackComponent.callbacks[trigger.onExit] function', () => {
        assert.equal(exitVal, ExitStartValue)
        triggerEnter(triggerEntity, testEntity, Hit)
        assert.notEqual(exitVal, ExitStartValue)
      })
      */
    })
  })

  describe('execute', () => {
    // it("should only run for entities that have both a TriggerComponent and a CollisionComponent  (aka. collisionQuery)", () => {})
    // it("should run `triggerEnter` for all entities that match the collisionQuery and have a hit.type === CollisionEvents.TRIGGER_START", () => {})
    // it("should run `triggerExit` for all entities that match the collisionQuery and have a hit.type === CollisionEvents.TRIGGER_END", () => {})
  })
})
