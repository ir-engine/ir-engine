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

import { getState } from '@etherealengine/hyperflux'

import { createEngine } from '../../initializeEngine'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { SceneObjectComponent } from '../../scene/components/SceneObjectComponent'
import { destroyEngine } from '../classes/Engine'
import { SceneState } from '../classes/Scene'
import { addComponent, defineQuery, hasComponent } from './ComponentFunctions'
import { unloadScene } from './EngineFunctions'
import { createEntity } from './EntityFunctions'

describe('EngineFunctions', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('unloadScene', () => {
    it('can unload all scene entities', async () => {
      const groupQuery = defineQuery([GroupComponent])
      const sceneObjectQuery = defineQuery([SceneObjectComponent])

      // create a bunch of entities
      addComponent(createEntity(), GroupComponent)
      const sceneEntity = createEntity()
      addComponent(sceneEntity, GroupComponent)
      addComponent(sceneEntity, SceneObjectComponent)

      const groupEntities = groupQuery()

      assert.equal(groupEntities.length, 4)

      await unloadScene()
      // camera entity and non scene entity shoulder persist
      assert.equal(groupQuery().length, 3)

      // should clean up world entity too
      assert.equal(hasComponent(getState(SceneState).sceneEntity, SceneObjectComponent), false)
      const persistedEntites = sceneObjectQuery()
      assert.equal(persistedEntites.length, 0)
    })
  })
})
