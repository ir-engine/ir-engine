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

import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { getMutableState } from '@etherealengine/hyperflux'

import { SystemUUID } from '@etherealengine/ecs'
import assert from 'assert'
import { createEngine } from '../../initializeEngine'
import { Physics } from '../classes/Physics'
import { PhysicsState } from '../state/PhysicsState'
import { PhysicsSystem } from './PhysicsSystem'

/**
 * @todo
 */
describe.skip('PhysicsSystem', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
  })

  afterEach(() => {
    return destroyEngine()
  })
})

describe('smoothKinematicBody', () => {
  // @todo
  // it("should interpolate the position of the KinematicBody of the given entity", () => {})
  // it("should interpolate the rotation of the KinematicBody of the given entity", () => {})
})

describe('PhysicsSystem', () => {
  describe('IDs', () => {
    it("should define the PhysicsSystem's UUID with the expected value", () => {
      assert.equal(PhysicsSystem, 'ee.engine.PhysicsSystem' as SystemUUID)
    })
  })

  describe('execute', () => {})

  describe('reactor', () => {})
})
