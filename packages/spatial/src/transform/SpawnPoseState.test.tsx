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
  Entity,
  EntityUUID,
  UUIDComponent,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  setComponent
} from '@ir-engine/ecs'
import { startReactor } from '@ir-engine/hyperflux'
import assert from 'assert'
import { Vector3 } from 'three'
import { assertVecApproxEq } from '../physics/classes/Physics.test'
import { SpawnPoseState } from './SpawnPoseState'
import { TransformComponent } from './components/TransformComponent'

describe('SpawnPoseState', () => {
  describe('Fields', () => {
    it('should initialize the *State.name field with the expected value', () => {
      assert.equal(SpawnPoseState.name, 'ee.SpawnPoseState')
    })

    it('should initialize the *State.initial field with the expected value', () => {
      assert.deepEqual(SpawnPoseState.initial, {})
    })

    it('should initialize the *State.receptors field with the expected value', () => {
      assert.notEqual(SpawnPoseState.receptors, undefined)
      assert.notEqual(SpawnPoseState.receptors.onSpawnObject, undefined)
    })
  }) //:: Fields

  /** @todo How to trigger the inner EntityNetworkReactor ?? */
  describe.skip('reactor', () => {
    describe('whenever [UUIDComponent.useEntityByUUID(props.uuid), SpawnPoseState.spawnPosition, SpawnPoseState.spawnRotation] change: for every entity UUID in SpawnPoseState.keys ...', () => {
      beforeEach(async () => {
        createEngine()
      })

      afterEach(() => {
        return destroyEngine()
      })

      it('... should update the entity with that UUID: TransformComponent.position should become SpawnPoseState.spawnPosition', () => {
        const Expected = new Vector3().setScalar(42)
        const Initial = new Vector3().setScalar(21)
        // Set the data as expected
        const keys: EntityUUID[] = [
          UUIDComponent.generateUUID(),
          UUIDComponent.generateUUID(),
          UUIDComponent.generateUUID()
        ]
        const entities: Entity[] = keys.map((uuid: EntityUUID) => {
          const entity = createEntity()
          setComponent(entity, UUIDComponent, uuid)
          setComponent(entity, TransformComponent, { position: Initial })
          return entity
        })
        // Sanity check before running
        for (const entity of entities) assertVecApproxEq(getComponent(entity, TransformComponent).position, Initial, 3)
        // Run and Check the result
        const root = startReactor(SpawnPoseState.reactor)
        root.run()
        for (const entity of entities) assertVecApproxEq(getComponent(entity, TransformComponent).position, Expected, 3)
      })

      // it("... should update the entity with that UUID: TransformComponent.rotation should become SpawnPoseState.spawnRotation", () => {})
      // it("... should not do anything if entity is falsy", () => {})
    })
  }) //:: reactor
}) //:: TweenComponent
