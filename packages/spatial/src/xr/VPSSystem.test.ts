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

import { describe } from 'vitest'

describe.todo('VPSSystem', () => {
  /**
  // @todo
  const System = SystemDefinitions.get(VPSSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.VPSSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      assert.equal(VPSSystem, 'ee.engine.VPSSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.after, undefined)
      assert.equal(System.insert!.after!, XRPersistentAnchorSystem)
    })
  }) //:: Fields
  */

  describe('execute', () => {
    /**
    // @todo
    // for every action in the PersistentAnchorActions.anchorFound list
      // for every entity with a PersistentAnchorComponent component
        // when the entity.PersistentAnchorComponent.name is the same as the current action.name
          // should set active to true
          // should copy action.position into entity.TransformComponent.position
          // should copy action.rotation into entity.TransformComponent.rotation
    // for every action in the PersistentAnchorActions.anchorUpdated list
      // for every entity with a PersistentAnchorComponent component
        // when the entity.PersistentAnchorComponent.name is the same as the current action.name
          // should copy action.position into entity.TransformComponent.position
          // should copy action.rotation into entity.TransformComponent.rotation
    // for every action in the PersistentAnchorActions.anchorLost list
      // for every entity with a PersistentAnchorComponent component
        // when the entity.PersistentAnchorComponent.name is the same as the current action.name
          // should set active to false
    */
  }) //:: execute
}) //:: VPSSystem
