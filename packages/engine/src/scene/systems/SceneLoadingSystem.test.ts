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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

import { destroyEngine } from '../../ecs/classes/Engine'
import { createEngine } from '../../initializeEngine'
import { SceneDataType, SceneJsonType } from '../../schemas/projects/scene.schema'

const sceneJSON_1 = {
  scene: {
    entities: {
      root: {
        name: 'Root',
        components: []
      }
    },
    root: 'root' as EntityUUID,
    version: 0
  } as SceneJsonType
} as SceneDataType

const sceneJSON_2 = {
  scene: {
    entities: {
      root: {
        name: 'Root',
        components: []
      },
      child_0: {
        name: 'Child 0',
        components: [],
        parent: 'root'
      }
    },
    root: 'root' as EntityUUID,
    version: 0
  } as SceneJsonType
} as SceneDataType

describe('SceneLoadingSystem', () => {
  beforeEach(() => {
    createEngine()
  })

  // describe('updateSceneFromJSON', () => {
  //   it('will load root entity', async () => {
  //     /** Load First Test Scene */
  //     const sceneState = getMutableState(SceneState)
  //     sceneState.sceneData.set(sceneJSON_1)

  //     await updateSceneFromJSON()

  //     const rootEntity = UUIDComponent.getEntityByUUID('root')
  //     assert(rootEntity)
  //     assert(hasComponent(rootEntity, EntityTreeComponent))
  //     assert(EntityTreeComponent.roots[rootEntity])
  //     assert.equal(getComponent(rootEntity, EntityTreeComponent).parentEntity, null)
  //     assert.equal(getComponent(rootEntity, NameComponent), 'Root')
  //   })

  //   it('will load child entity', async () => {
  //     const sceneState = getMutableState(SceneState)
  //     sceneState.sceneData.set(sceneJSON_1)

  //     await updateSceneFromJSON()

  //     sceneState.sceneData.set(sceneJSON_2)
  //     await updateSceneFromJSON()

  //     const rootEntity = UUIDComponent.getEntityByUUID('root')
  //     const childEntity = UUIDComponent.getEntityByUUID('child_0')
  //     assert(childEntity)
  //     assert(hasComponent(childEntity, EntityTreeComponent))
  //     assert.equal(getComponent(childEntity, EntityTreeComponent).parentEntity, rootEntity)
  //     assert.equal(getComponent(childEntity, NameComponent), 'Child 0')
  //   })

  //   it('will unload child entity', async () => {
  //     const sceneState = getMutableState(SceneState)
  //     sceneState.sceneData.set(sceneJSON_2)

  //     await updateSceneFromJSON()

  //     sceneState.sceneData.set(sceneJSON_1)
  //     await updateSceneFromJSON()

  //     const rootEntity = UUIDComponent.getEntityByUUID('root')
  //     const childEntity = UUIDComponent.getEntityByUUID('child_0')
  //     assert(rootEntity)
  //     assert.equal(childEntity, undefined)
  //   })
  // })

  afterEach(() => {
    return destroyEngine()
  })
})
