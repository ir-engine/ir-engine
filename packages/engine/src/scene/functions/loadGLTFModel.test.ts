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
import { Group, Layers, Mesh, Scene } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { destroyEngine } from '../../ecs/classes/Engine'
import { SceneState } from '../../ecs/classes/Scene'
import {
  addComponent,
  defineComponent,
  defineQuery,
  getComponent,
  getMutableComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addEntityNodeChild } from '../../ecs/functions/EntityTree'
import { createEngine } from '../../initializeEngine'
import { TransformComponent, setLocalTransformComponent } from '../../transform/components/TransformComponent'
import { GroupComponent, addObjectToGroup } from '../components/GroupComponent'
import { ModelComponent } from '../components/ModelComponent'
import { NameComponent } from '../components/NameComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { parseGLTFModel } from './loadGLTFModel'

describe('loadGLTFModel', () => {
  beforeEach(() => {
    createEngine()
    createMockNetwork()
  })

  afterEach(() => {
    return destroyEngine()
  })

  // TODO: - this needs to be broken down and more comprehensive
  it('loadGLTFModel', async () => {
    const sceneEntity = getState(SceneState).sceneEntity

    const mockComponentData = { src: '' } as any
    const CustomComponent = defineComponent({
      name: 'CustomComponent',
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
    addEntityNodeChild(entity, sceneEntity)
    setLocalTransformComponent(entity, sceneEntity)
    addComponent(entity, ModelComponent, {
      ...mockComponentData
    })
    const entityName = 'entity name'
    const number = Math.random()
    const mesh = new Scene()
    mesh.userData = {
      'xrengine.entity': entityName,
      // 'xrengine.spawn-point': '',
      'xrengine.CustomComponent.val': number
    }
    const modelComponent = getMutableComponent(entity, ModelComponent)
    modelComponent.scene.set(mesh)
    addObjectToGroup(entity, mesh)
    const modelQuery = defineQuery([TransformComponent, GroupComponent])
    const childQuery = defineQuery([
      NameComponent,
      TransformComponent,
      GroupComponent,
      CustomComponent /*, SpawnPointComponent*/
    ])

    parseGLTFModel(entity)

    const expectedLayer = new Layers()
    expectedLayer.set(ObjectLayers.Scene)

    const [mockModelEntity] = modelQuery()
    const [mockSpawnPointEntity] = childQuery()

    assert.equal(typeof mockModelEntity, 'number')
    assert(getComponent(mockModelEntity, GroupComponent)[0].layers.test(expectedLayer))

    // assert(hasComponent(mockSpawnPointEntity, SpawnPointComponent))
    assert.equal(getComponent(mockSpawnPointEntity, CustomComponent).val, number)
    assert.equal(getComponent(mockSpawnPointEntity, NameComponent), entityName)
    assert(getComponent(mockSpawnPointEntity, GroupComponent)[0].layers.test(expectedLayer))
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
