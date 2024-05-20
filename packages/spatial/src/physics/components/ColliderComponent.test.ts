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

import { createEntity, destroyEngine, removeComponent, setComponent } from '@etherealengine/ecs'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import { createEngine } from '../../initializeEngine'
import { TransformComponent } from '../../SpatialModule'
import { Physics } from '../classes/Physics'
import { PhysicsState } from '../state/PhysicsState'
import { handlePhysicsEnterExitQueries } from '../systems/PhysicsSystem'
import { ColliderComponent } from './ColliderComponent'
import { RigidBodyComponent } from './RigidBodyComponent'
import { TriggerComponent } from './TriggerComponent'

describe('ColliderComponent', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should add collider to rigidbody', () => {
    const physicsWorld = getState(PhysicsState).physicsWorld
    const entity = createEntity()

    setComponent(entity, TransformComponent)
    setComponent(entity, RigidBodyComponent, { type: 'fixed' })
    setComponent(entity, ColliderComponent)

    handlePhysicsEnterExitQueries(physicsWorld)

    const body = Physics._Rigidbodies.get(entity)!
    const collider = Physics._Colliders.get(entity)!

    assert.equal(body.numColliders(), 1)
    assert(collider)
    assert.equal(collider, body.collider(0))
  })

  it('should remove collider from rigidbody', () => {
    const physicsWorld = getState(PhysicsState).physicsWorld
    const entity = createEntity()

    setComponent(entity, TransformComponent)
    setComponent(entity, RigidBodyComponent, { type: 'fixed' })
    setComponent(entity, ColliderComponent)

    handlePhysicsEnterExitQueries(physicsWorld)

    const body = Physics._Rigidbodies.get(entity)!
    const collider = Physics._Colliders.get(entity)!

    assert.equal(body.numColliders(), 1)
    assert(collider)
    assert.equal(collider, body.collider(0))

    removeComponent(entity, ColliderComponent)

    handlePhysicsEnterExitQueries(physicsWorld)

    assert.equal(body.numColliders(), 0)
  })

  it('should add trigger collider', () => {
    const physicsWorld = getState(PhysicsState).physicsWorld
    const entity = createEntity()

    setComponent(entity, TransformComponent)

    setComponent(entity, RigidBodyComponent, { type: 'fixed' })
    setComponent(entity, TriggerComponent)
    setComponent(entity, ColliderComponent)

    handlePhysicsEnterExitQueries(physicsWorld)

    const collider = Physics._Colliders.get(entity)!
    assert.equal(collider!.isSensor(), true)
  })
})
