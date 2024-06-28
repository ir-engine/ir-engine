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

import {
  Entity,
  UndefinedEntity,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent,
  startEngine
} from '@etherealengine/ecs'
import assert from 'assert'
import { ColliderHitEvent } from '../types/PhysicsTypes'
import { CollisionComponent } from './CollisionComponent'

const CollisionComponentDefaults = new Map<Entity, ColliderHitEvent>()

describe('CollisionComponent', () => {
  describe('IDs', () => {
    it('should initialize the CollisionComponent.name field with the expected value', () => {
      assert.equal(CollisionComponent.name, 'CollisionComponent')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      startEngine()
      testEntity = createEntity()
      setComponent(testEntity, CollisionComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, CollisionComponent)
      assert.deepEqual(data, CollisionComponentDefaults)
    })
  }) // << onInit
})
