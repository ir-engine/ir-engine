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
  createEngine,
  createEntity,
  destroyEngine,
  EntityUUID,
  getComponent,
  setComponent,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { v4 } from 'uuid'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { SceneSettingsComponent } from './SceneSettingsComponent'

describe('SceneSettingsComponent', () => {
  let entity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
    setComponent(entity, UUIDComponent, v4() as EntityUUID)
  })

  afterEach(() => {
    destroyEngine()
  })

  it('Should set the name to SceneSettingsComponent', () => {
    assert.equal(SceneSettingsComponent.name, 'SceneSettingsComponent')
  })
  it('Should set the jsonID to EE_scene_settings', () => {
    assert.equal(SceneSettingsComponent.jsonID, 'EE_scene_settings')
  })
  it('Should set the initial data of the component correctly', () => {
    // Loop through datasets and compare values
    const assertDatasetsEquals = (actual, expected) => {
      for (const [key, value] of Object.entries(actual)) {
        assert.equal(actual[key], expected[key])
      }
    }

    setComponent(entity, SceneSettingsComponent)
    const entityUUID = getComponent(entity, UUIDComponent)
    const initialData = {
      thumbnailURL: '',
      loadingScreenURL: '',
      primaryColor: '#000000',
      backgroundColor: '#FFFFFF',
      alternativeColor: '#000000',
      sceneKillHeight: -10,
      spectateEntity: UndefinedEntity
    }
    const initialComponent = getComponent(entity, SceneSettingsComponent)
    // Check initial setting
    assertDatasetsEquals(initialData, initialComponent)

    const changedData = {
      thumbnailURL: 'url1',
      loadingScreenURL: 'url2',
      primaryColor: '#000001',
      backgroundColor: '#FFFFFG',
      alternativeColor: '#000001',
      sceneKillHeight: -1,
      spectateEntity: entityUUID as EntityUUID
    }
    setComponent(entity, SceneSettingsComponent, changedData)
    const changedComponent = getComponent(entity, SceneSettingsComponent)
    // Check if data changed correctly
    assertDatasetsEquals(changedData, changedComponent)
  })
})
