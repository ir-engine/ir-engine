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

import { MathUtils } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { ComponentJson, EntityJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { getState } from '@etherealengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import {
  getAllComponents,
  getComponent,
  getOptionalComponent,
  hasComponent,
  serializeComponent
} from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent, iterateEntityNode } from '../../ecs/functions/EntityTree'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { NameComponent } from '../components/NameComponent'
import { LoadState, PrefabComponent } from '../components/PrefabComponent'
import { UUIDComponent } from '../components/UUIDComponent'

export const serializeEntity = (entity: Entity) => {
  const ignoreComponents = getOptionalComponent(entity, GLTFLoadedComponent)

  const jsonComponents = [] as ComponentJson[]
  const components = getAllComponents(entity)

  for (const component of components) {
    const sceneComponentID = component.jsonID
    if (sceneComponentID && !ignoreComponents?.includes(component.name)) {
      const data = serializeComponent(entity, component)
      if (data) {
        jsonComponents.push({
          name: sceneComponentID,
          props: Object.assign({}, JSON.parse(JSON.stringify(data)))
        })
      }
    }
  }
  return jsonComponents
}

export const serializeWorld = (rootEntity?: Entity, generateNewUUID = false) => {
  const sceneJson = {
    version: 0,
    entities: {},
    root: null! as EntityUUID
  }

  const sceneEntity = getState(SceneState).sceneEntity

  const traverseNode = rootEntity ?? sceneEntity
  const loadedAssets = new Set<Entity>()
  iterateEntityNode(
    traverseNode,
    (entity, index) => {
      const ignoreComponents = getOptionalComponent(entity, GLTFLoadedComponent)

      if (ignoreComponents?.includes('entity')) return

      const uuid = generateNewUUID ? (MathUtils.generateUUID() as EntityUUID) : getComponent(entity, UUIDComponent)
      const entityJson = (sceneJson.entities[uuid] = { components: [] as ComponentJson[] } as EntityJson)

      const entityTree = getComponent(entity, EntityTreeComponent)

      if (entity !== sceneEntity) {
        entityJson.parent = getComponent(entityTree.parentEntity!, UUIDComponent)
        entityJson.index = index
      }

      if (entity === rootEntity || !entityTree.parentEntity) {
        sceneJson.root = uuid
      }

      entityJson.name = getComponent(entity, NameComponent)

      entityJson.components = serializeEntity(entity)

      if (hasComponent(entity, PrefabComponent)) {
        const asset = getComponent(entity, PrefabComponent)
        if (asset.loaded === LoadState.LOADED) {
          asset.roots.map((root) => loadedAssets.add(root))
        }
      }
    },
    (node) => !loadedAssets.has(node),
    true
  )

  return sceneJson
}
