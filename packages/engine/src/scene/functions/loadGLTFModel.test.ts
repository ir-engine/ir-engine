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
import { Group, Layers, MathUtils, Mesh, Scene } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { defineComponent, getComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { createEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { GroupComponent, addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { createMockNetwork } from '@etherealengine/spatial/tests/util/createMockNetwork'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { ModelComponent } from '../components/ModelComponent'
import { parseGLTFModel } from './loadGLTFModel'
import { getModelSceneID } from './loaders/ModelFunctions'

describe.skip('loadGLTFModel', () => {
  beforeEach(() => {
    createEngine()
    createMockNetwork()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  // TODO: - this needs to be broken down and more comprehensive
  it('loadGLTFModel', async () => {
    const sceneEntity = SceneState.getRootEntity(getState(SceneState).activeScene!)

    const mockComponentData = { src: '' } as any
    const CustomComponent = defineComponent({
      name: 'CustomComponent',
      jsonID: 'custom-component',
      onInit(entity) {
        return {
          val: 0
        }
      },
      onSet(entity, component, json) {
        if (!json) return
        if (typeof json.val === 'number') component.val.set(json.val)
      }
    })

    const entity = createEntity()
    const uuid = MathUtils.generateUUID() as EntityUUID
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity, uuid })
    setComponent(entity, ModelComponent, {
      ...mockComponentData
    })
    const entityName = 'entity name'
    const number = Math.random()
    const scene = new Scene()
    const mesh = new Mesh()
    mesh.userData = {
      'xrengine.entity': entityName,
      // 'xrengine.spawn-point': '',
      'xrengine.CustomComponent.val': number
    }
    scene.add(mesh)
    addObjectToGroup(entity, mesh)
    const modelQuery = defineQuery([TransformComponent, GroupComponent])
    const childQuery = defineQuery([
      NameComponent,
      TransformComponent,
      GroupComponent,
      CustomComponent /*, SpawnPointComponent*/
    ])
    //todo: revise this so that we're forcing the sceneloadingsystem to execute its reactors,
    //      then we can validate the ECS data directly like we were doing before
    const jsonHierarchy = parseGLTFModel(entity, scene)
    const sceneID = getModelSceneID(entity)
    getMutableState(SceneState).scenes[sceneID].set({
      metadata: {
        name: 'test scene',
        project: 'test project',
        thumbnailUrl: ''
      },
      snapshots: [
        {
          data: {
            entities: jsonHierarchy,
            root: '' as EntityUUID,
            version: 0
          },
          selectedEntities: []
        }
      ],
      index: 0
    })

    const expectedLayer = new Layers()
    expectedLayer.set(ObjectLayers.Scene)

    const [mockModelEntity] = modelQuery()
    const [mockSpawnPointEntity] = childQuery()

    assert.equal(typeof mockModelEntity, 'number')
    assert(getComponent(mockModelEntity, GroupComponent)[0].layers.test(expectedLayer))
    const modelSceneID = getModelSceneID(entity)
    const currentScene = SceneState.getScene(modelSceneID)!
    assert.notEqual(currentScene, null)
    const childUUID = Object.keys(currentScene.entities).find((key) => {
      const entityJson = currentScene.entities[key as EntityUUID]
      return entityJson.parent === uuid
    })
    assert.notEqual(childUUID, undefined)
    const entityJson = currentScene.entities[childUUID as EntityUUID]
    assert.notEqual(entityJson, undefined)
    const val = entityJson.components.find((component) => component.name === CustomComponent.jsonID)?.props?.val
    assert.equal(val, number)
    assert.equal(entityJson.name, entityName)
  })

  // TODO
  it.skip('Can load physics objects from gltf metadata', async () => {
    const entity = createEntity()
    const entityName = 'physics test entity'
    const parentGroup = new Group()
    parentGroup.userData = {
      'xrengine.entity': entityName,
      'xrengine.collider.bodyType': 0
    }

    const mesh = new Mesh()
    mesh.userData = {
      type: 'box'
    }
    parentGroup.add(mesh)

    // createShape()
    // createCollider()
  })
})
