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

import matches from 'ts-matches'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { EntityJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'

import { useEffect } from 'react'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent, iterateEntityNode, removeEntityNodeRecursively } from '../../ecs/functions/EntityTree'
import { serializeEntity } from '../functions/serializeWorld'
import { updateSceneEntity } from '../systems/SceneLoadingSystem'
import { CallbackComponent, setCallback } from './CallbackComponent'
import { NameComponent } from './NameComponent'
import { UUIDComponent } from './UUIDComponent'

export type LoadVolumeTarget = {
  uuid: EntityUUID
  entities: (EntityJson & { uuid: EntityUUID })[]
  loaded: boolean
}

export type LoadVolumeComponentType = {
  targets: LoadVolumeTarget[]
}

export const LoadVolumeComponent = defineComponent({
  name: 'EE_load_volume',
  jsonID: 'load-volume',
  onInit: (entity) => ({ targets: [] }) as LoadVolumeComponentType,
  toJSON: (entity, component) => {
    return component.value
  },
  onSet: (entity, component, json) => {
    if (!json) return

    if (
      matches
        .arrayOf(
          matches.shape({
            uuid: matches.string,
            entities: matches.arrayOf(
              matches.partial({
                uuid: matches.string,
                name: matches.string,
                parent: matches.string,
                components: matches.any
              })
            ),
            loaded: matches.boolean
          })
        )
        .test(json.targets)
    ) {
      component.targets.set(json.targets)
    }
  },
  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, LoadVolumeComponent)
    useEffect(() => {
      function doLoad() {
        component.targets.value.map(({ uuid, loaded, entities }, index) => {
          if (loaded) return
          for (const entityJson of entities) {
            const { name, parent, components } = entityJson
            const nuJson = JSON.parse(JSON.stringify({ name, parent, components }))
            updateSceneEntity(entityJson.uuid, nuJson)
          }
          component.targets[index].loaded.set(true)
        })
      }

      function doUnload() {
        component.targets.value.map(({ uuid, loaded }, index) => {
          if (!loaded) return
          const rootEntity = UUIDComponent.entitiesByUUID[uuid]
          const entities = iterateEntityNode(rootEntity, (targetEntity) => {
            const entityTreeNode = getComponent(targetEntity, EntityTreeComponent)
            const parentNode = entityTreeNode.parentEntity!
            const componentJson = serializeEntity(targetEntity)
            const entityJson: EntityJson & { uuid: EntityUUID } = {
              uuid: getComponent(targetEntity, UUIDComponent),
              name: getComponent(targetEntity, NameComponent),
              parent: getComponent(parentNode, UUIDComponent),
              components: componentJson
            }
            return entityJson
          })
          component.targets[index].set({ uuid, loaded: false, entities })
          removeEntityNodeRecursively(rootEntity)
        })
      }

      if (hasComponent(entity, CallbackComponent)) {
        removeComponent(entity, CallbackComponent)
      }

      setCallback(entity, 'doLoad', doLoad)
      setCallback(entity, 'doUnload', doUnload)
    }, [component.targets])

    return null
  }
})
